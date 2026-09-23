// Production-Ready Document-Grounded RAG Pipeline for LexiGuide
// Implements PRD §16, §17, §26, §27 & exact LexiGuide Rules 1–14

import { Clause, Citation, SourceStatus, ChatMessage } from '@/types';
import {
  LEXIGUIDE_SYSTEM_PROMPT,
  NOT_FOUND_RESPONSE,
  buildSecureSystemPrompt,
  sanitizeAndCheckPrompt,
  enforceLegalGuardrails
} from './guardrails';

export interface GroundedRAGResult {
  answer: string;
  sourceStatus: SourceStatus;
  statusLabel: string;
  citations: Citation[];
  suggestedFollowUps: string[];
  isStreaming?: boolean;
}

// Common legal synonyms for query expansion & hybrid semantic retrieval
const LEGAL_SYNONYMS: Record<string, string[]> = {
  resignation: ['resign', 'notice', 'departure', 'quit', 'leaving', 'employment'],
  resign: ['resignation', 'notice', 'departure', 'quit'],
  notice: ['written notice', 'prior notice', 'days notice', 'notification'],
  renew: ['renewal', 'automatic renewal', 'extend', 'extension', 'continue'],
  renewal: ['renew', 'automatic renewal', 'extend', 'expiration'],
  terminate: ['termination', 'breach', 'cure', 'cancel', 'expiration', 'end'],
  termination: ['terminate', 'breach', 'cure', 'material breach', 'notice of termination'],
  rent: ['lease', 'monthly rent', 'due', 'payment', 'premises', 'landlord', 'tenant'],
  deposit: ['security deposit', 'refund', 'deductions', 'return of deposit'],
  confidentiality: ['confidential', 'nondisclosure', 'disclosure', 'secret', 'proprietary'],
  confidential: ['confidentiality', 'nondisclosure', 'disclosure', 'receiving party'],
  ip: ['intellectual property', 'copyright', 'patent', 'ownership', 'created', 'inventions', 'work product'],
  ownership: ['own', 'intellectual property', 'title', 'vest', 'created'],
  payment: ['invoice', 'fee', 'monthly', 'due', 'pay', 'receipt', 'amount'],
  indemnity: ['indemnify', 'hold harmless', 'claims', 'damages', 'losses', 'liability'],
  indemnification: ['indemnify', 'hold harmless', 'third-party', 'claims'],
  law: ['governing law', 'jurisdiction', 'state of', 'courts', 'governed by']
};

/**
 * Contextualizes user query by incorporating previous conversational context
 * to resolve pronouns and implicit references.
 */
export function rewriteQueryWithContext(query: string, history: ChatMessage[] = []): string {
  const qTrim = query.trim();
  const qLower = qTrim.toLowerCase();

  // If query already contains substantive terms or history is empty, use query directly
  if (history.length === 0 || qTrim.length > 50) {
    return qTrim;
  }

  // Exclude general document references like "this contract", "this agreement", "this document"
  const cleanForPronounCheck = qLower.replace(/\b(this|the)\s+(contract|agreement|document|lease|sow)\b/g, '');

  // Detect genuine pronoun or continuation patterns ("what about it?", "how long is that?", "what is the deadline for it?")
  const hasPronoun =
    /\b(it|that|this clause|that clause|this provision|that provision|the clause)\b/i.test(cleanForPronounCheck) ||
    /^(what about|how about|and the)\b/i.test(qLower);

  if (hasPronoun) {
    // Find the last assistant or user message that referenced substantive legal terms
    const prevMessages = history.slice(-4);
    for (let i = prevMessages.length - 1; i >= 0; i--) {
      const msg = prevMessages[i];
      const substantiveMatches = msg.content.match(/\b(termination|confidentiality|intellectual property|rent|deposit|renewal|indemnity|payment|notice|governing law)\b/i);
      if (substantiveMatches) {
        return `${qTrim} in relation to ${substantiveMatches[0]}`;
      }
    }
  }

  return qTrim;
}

/**
 * Scores and retrieves relevant clauses using hybrid BM25-style keyword matching
 * and domain-specific semantic expansion.
 */
export function retrieveRelevantClauses(
  rawQuery: string,
  clauses: Clause[],
  topK: number = 3
): { clause: Clause; score: number; matchReasons: string[] }[] {
  if (!clauses || clauses.length === 0) return [];

  const qLower = rawQuery.toLowerCase();

  const STOP_WORDS = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'can', 'could', 'should', 'would', 'will', 'shall', 'what', 'when', 'where', 'which',
    'who', 'whom', 'whose', 'why', 'how', 'me', 'my', 'i', 'you', 'your', 'about',
    'this', 'that', 'these', 'those', 'there', 'here', 'all', 'any', 'both', 'each',
    'every', 'other', 'some', 'such', 'its', 'our', 'their', 'more', 'most', 'same',
    'so', 'than', 'too', 'very', 'also', 'just', 'only', 'own',
    'document', 'documents', 'agreement', 'agreements', 'contract', 'contracts',
    'party', 'parties', 'section', 'sections', 'clause', 'clauses', 'provision', 'provisions',
    'provide', 'provides', 'provided', 'give', 'gives', 'given', 'right', 'rights',
    'under', 'herein', 'thereof', 'therein', 'hereunder', 'thereto', 'item', 'items', 'with', 'from', 'into'
  ]);

  const rawWords = qLower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  if (rawWords.length === 0) {
    return [];
  }

  // Expand with synonyms
  const queryTerms = new Set<string>(rawWords);
  for (const w of rawWords) {
    if (LEGAL_SYNONYMS[w]) {
      for (const syn of LEGAL_SYNONYMS[w]) {
        queryTerms.add(syn.toLowerCase());
      }
    }
  }

  // Check if at least one substantive query term or synonym is present in the document
  const hasSubstantiveTermInDoc = clauses.some(c => {
    const combined = `${c.title} ${c.category} ${c.originalText} ${c.plainEnglish}`.toLowerCase();
    for (const term of queryTerms) {
      if (combined.includes(term)) {
        // Exclude explicit negation ("without any mention of <term>", "does not specify <term>")
        const negationPattern = new RegExp(`(without\\s+(any\\s+)?mention\\s+of|does\\s+not\\s+specify|no\\s+provision\\s+for|not\\s+entitled\\s+to)\\s+[^.]*?${term}`, 'i');
        if (!negationPattern.test(combined)) {
          return true;
        }
      }
    }
    return false;
  });

  if (!hasSubstantiveTermInDoc) {
    return [];
  }

  // Score each clause
  const scored = clauses.map(c => {
    let score = 0;
    const reasons: string[] = [];

    const titleLower = c.title.toLowerCase();
    const catLower = c.category.toLowerCase();
    const textLower = c.originalText.toLowerCase();
    const sectionStr = `section ${c.sectionNumber}`.toLowerCase();

    // 1. Direct phrase match in clause text (+15)
    if (rawQuery.length > 8 && textLower.includes(rawQuery.toLowerCase())) {
      score += 15;
      reasons.push('exact phrase in text');
    }

    // 2. Section number match (+12)
    if (c.sectionNumber && (qLower.includes(c.sectionNumber.toLowerCase()) || qLower.includes(sectionStr))) {
      score += 12;
      reasons.push(`matches Section ${c.sectionNumber}`);
    }

    // 3. Title match (+8 per matching term)
    for (const term of queryTerms) {
      if (titleLower.includes(term)) {
        score += 8;
        reasons.push(`title contains "${term}"`);
      }
    }

    // 4. Category match (+6 per term)
    for (const term of queryTerms) {
      if (catLower.includes(term)) {
        score += 6;
        reasons.push(`category "${c.category}" matches "${term}"`);
      }
    }

    // 5. Text keyword density & occurrences (excluding negations)
    for (const term of queryTerms) {
      if (textLower.includes(term)) {
        const negationRegex = new RegExp(`(without\\s+(any\\s+)?mention\\s+of|does\\s+not\\s+specify|no\\s+provision\\s+for)\\s+[^.]*?${term}`, 'i');
        if (!negationRegex.test(textLower)) {
          const matches = textLower.split(term).length - 1;
          score += Math.min(10, matches * 3);
          reasons.push(`text mentions "${term}" (${matches}x)`);
        }
      }
    }

    return { clause: c, score, matchReasons: reasons };
  });

  // Filter clauses that meet minimum substantive relevance (score >= 8)
  return scored
    .filter(item => item.score >= 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Synthesizes a factual, citation-grounded response using retrieved clauses.
 * If external LLM API is configured, calls Google Gemini.
 * Otherwise, uses a high-precision grounded extractive synthesis engine.
 */
export async function executeGroundedRAG(
  query: string,
  clauses: Clause[],
  history: ChatMessage[] = [],
  customApiKey?: string
): Promise<GroundedRAGResult> {
  // Step 1: Input validation & prompt-injection check
  const securityCheck = sanitizeAndCheckPrompt(query);
  if (!securityCheck.isSafe) {
    return {
      answer: 'Security Policy Notice: The submitted query contained instruction override or prompt manipulation patterns and was neutralized.',
      sourceStatus: 'NOT_FOUND',
      statusLabel: '— Neutralized',
      citations: [],
      suggestedFollowUps: ['Please ask a standard question regarding the document clauses.']
    };
  }

  // Step 2: Query rewriting with history
  const contextualQuery = rewriteQueryWithContext(securityCheck.sanitizedInput, history);

  // Step 3: Retrieve top relevant clauses
  const retrieved = retrieveRelevantClauses(contextualQuery, clauses, 3);

  // Step 4: Absence handling — if no relevant evidence found, explicitly abstain
  if (retrieved.length === 0) {
    return {
      answer: NOT_FOUND_RESPONSE,
      sourceStatus: 'NOT_FOUND',
      statusLabel: '— Not found in document',
      citations: [],
      suggestedFollowUps: clauses.slice(0, 3).map(c => `What are the terms of ${c.title}?`)
    };
  }

  const top = retrieved[0].clause;
  const citations: Citation[] = retrieved.map(r => ({
    id: `cit-${r.clause.id}`,
    section: `Section ${r.clause.sectionNumber}`,
    page: r.clause.pageNumber,
    excerpt: r.clause.originalText.length > 220
      ? r.clause.originalText.substring(0, 217) + '...'
      : r.clause.originalText,
    relevanceScore: Math.min(100, r.score * 10)
  }));

  // Determine Source Status
  let sourceStatus: SourceStatus = 'DIRECTLY_STATED';
  let statusLabel = '✓ Directly stated';

  const textLower = top.originalText.toLowerCase();
  if (textLower.includes('sole discretion') || textLower.includes('reasonable efforts') || textLower.includes('from time to time')) {
    sourceStatus = 'AMBIGUOUS';
    statusLabel = '? Unclear / ambiguous';
  } else if (retrieved[0].score < 12) {
    sourceStatus = 'INFERRED';
    statusLabel = '≈ Inferred from document';
  }

  // Step 5: Check for external LLM API Key (Google Gemini)
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey) {
    try {
      const contextText = retrieved
        .map(r => `[Section ${r.clause.sectionNumber}, Page ${r.clause.pageNumber}]:\n${r.clause.originalText}`)
        .join('\n\n');

      const systemPrompt = buildSecureSystemPrompt(contextText);

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nUser Question: ${contextualQuery}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 500
            }
          })
        }
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim().length > 0) {
          const safeText = enforceLegalGuardrails(candidateText.trim());
          return {
            answer: safeText,
            sourceStatus,
            statusLabel,
            citations,
            suggestedFollowUps: [
              `What are the requirements under Section ${top.sectionNumber}?`,
              'How does this clause interact with termination?',
              'What questions should I ask a legal professional about this?'
            ]
          };
        }
      }
    } catch (apiErr) {
      console.warn('Gemini API call failed, falling back to grounded extractive synthesis:', apiErr);
    }
  }

  // Step 6: Grounded Extractive Synthesizer (Reliable, deterministic, zero hallucination)
  const sectionRef = `Section ${top.sectionNumber}`;
  const pageRef = `Page ${top.pageNumber}`;

  // Extract key operative sentences from the top clause
  const sentences = top.originalText.split(/[.!?]\s+/).filter(s => s.trim().length > 15);
  const relevantSentence = sentences.find(s => {
    const sLow = s.toLowerCase();
    return contextualQuery.toLowerCase().split(/\s+/).some(w => w.length > 3 && sLow.includes(w));
  }) || sentences[0] || top.originalText;

  let answer = `According to **${sectionRef} (${pageRef})**, ${relevantSentence.trim()}.`;

  // Provide supplementary context if clause has obligations or conditions
  if (top.yourObligation) {
    answer += `\n\n*Document Stated Obligation:* ${top.yourObligation}`;
  }

  answer += `\n\n*(Source: [${sectionRef}, ${pageRef}])*`;

  const safeAnswer = enforceLegalGuardrails(answer);

  return {
    answer: safeAnswer,
    sourceStatus,
    statusLabel,
    citations,
    suggestedFollowUps: [
      `What are the specific conditions under ${sectionRef}?`,
      'Does this provision automatically renew?',
      'What questions should I discuss with a lawyer regarding this section?'
    ]
  };
}
