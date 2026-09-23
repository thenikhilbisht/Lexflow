import { NextRequest, NextResponse } from 'next/server';
import { db, checkRateLimit } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { sanitizeAndCheckPrompt, NOT_FOUND_RESPONSE } from '@/lib/ai/guardrails';
import { executeGroundedRAG } from '@/lib/ai/rag';
import { ChatMessage } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication Check
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to ask questions.' }, { status: 401 });
    }

    const documentId = params.id;
    const body = await req.json().catch(() => ({}));
    const rawQuery = (body.query || body.question || '') as string;
    const wantStream = Boolean(body.stream);

    // 2. Input Validation (PRD §48)
    if (!rawQuery || typeof rawQuery !== 'string' || rawQuery.trim().length === 0) {
      return NextResponse.json({ error: 'Please enter a valid question.' }, { status: 400 });
    }

    if (rawQuery.trim().length > 2000) {
      return NextResponse.json({ error: 'Question exceeds the maximum length of 2,000 characters.' }, { status: 400 });
    }

    // 3. Rate Limiting (PRD §46, 30 queries/minute per user)
    const rateCheck = checkRateLimit(`chat:${user.id}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please wait ${rateCheck.retryAfterSec || 30} seconds before asking another question.`
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSec || 30)
          }
        }
      );
    }

    // 4. Document Access Authorization
    const doc = db.getDocumentById(documentId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && doc.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this document.' }, { status: 403 });
    }

    // 5. Prompt Injection Defense on User Query (PRD §27)
    const securityCheck = sanitizeAndCheckPrompt(rawQuery);
    if (!securityCheck.isSafe) {
      return NextResponse.json(
        {
          error: 'Security Policy Notice: The submitted query contained instruction override or prompt manipulation patterns and was neutralized.'
        },
        { status: 400 }
      );
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      conversationId: `conv-${documentId}`,
      role: 'user',
      content: securityCheck.sanitizedInput,
      createdAt: new Date().toISOString()
    };

    // Save user message to persistent conversation history
    db.saveChatMessage(documentId, user.id, userMsg);

    // 6. Retrieve real clauses for this document
    const clauses = db.getClauses(documentId);

    if (clauses.length === 0) {
      const emptyMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        conversationId: `conv-${documentId}`,
        role: 'assistant',
        content: NOT_FOUND_RESPONSE,
        sourceStatus: 'NOT_FOUND',
        citations: [],
        suggestedFollowUps: [],
        createdAt: new Date().toISOString()
      };
      db.saveChatMessage(documentId, user.id, emptyMsg);
      return NextResponse.json(emptyMsg);
    }

    // 7. Load persistent conversation history for contextual query rewriting
    const history = db.getChatHistory(documentId, user.id);

    // 8. Execute Document-Grounded RAG Pipeline
    const ragResult = await executeGroundedRAG(securityCheck.sanitizedInput, clauses, history);

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      conversationId: `conv-${documentId}`,
      role: 'assistant',
      content: ragResult.answer,
      sourceStatus: ragResult.sourceStatus,
      citations: ragResult.citations,
      suggestedFollowUps: ragResult.suggestedFollowUps,
      createdAt: new Date().toISOString()
    };

    // Save assistant message to persistent conversation history
    db.saveChatMessage(documentId, user.id, assistantMsg);
    db.incrementQueryCount();

    // 9. Streaming SSE or Standard JSON response
    if (wantStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const words = ragResult.answer.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? '' : ' ') + words[i];
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ token: chunk })}\n\n`)
            );
            // Slight delay (12ms) to produce smooth realistic streaming tokens
            await new Promise((r) => setTimeout(r, 12));
          }

          // Emit complete final message with citations and sourceStatus
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, message: assistantMsg })}\n\n`)
          );
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive'
        }
      });
    }

    return NextResponse.json(assistantMsg);
  } catch (err: any) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process question' }, { status: 500 });
  }
}
