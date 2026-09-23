import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { extractTextFromBuffer, analyzeDocumentContent } from '@/lib/ai/parser';
import { DocumentType, LegalDocument } from '@/types';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If ADMIN or SUPER_ADMIN, return all docs; otherwise return user's own docs
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return NextResponse.json(db.documents);
  }

  return NextResponse.json(db.getDocumentsForUser(user.id));
}

export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to upload documents.' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let filename = '';
    let mimeType = 'text/plain';
    let documentType: DocumentType = 'Service Agreement';
    let fileBuffer: Buffer | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      documentType = (formData.get('documentType') as DocumentType) || 'Service Agreement';

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data.' }, { status: 400 });
      }

      filename = file.name;
      mimeType = file.type || 'application/octet-stream';
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      // JSON fallback
      const body = await req.json();
      filename = body.filename || 'Untitled Document.txt';
      documentType = body.documentType || 'Service Agreement';
      mimeType = body.mimeType || 'text/plain';
      fileBuffer = Buffer.from(body.content || '', 'utf8');
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty.' }, { status: 400 });
    }

    // Maximum file size check: 25 MB (PRD §9 & §47)
    if (fileBuffer.length > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 25 MB limit.' }, { status: 400 });
    }

    // Real Text Extraction
    const { text, pageCount } = await extractTextFromBuffer(fileBuffer, filename, mimeType);

    if (!text || text.trim().length < 15) {
      return NextResponse.json({
        error: "We couldn't extract readable text from this document. The file may be an image-only scan or corrupted. Please try uploading a clearer text-based document."
      }, { status: 400 });
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    // Save raw binary file to disk for PDF.js / direct file serving
    try {
      const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, `${docId}.pdf`), fileBuffer);
    } catch (fsErr) {
      console.warn('Failed to save raw upload file to disk:', fsErr);
    }

    // Real Analysis & Parsing
    const parsed = analyzeDocumentContent(docId, text, documentType, pageCount);
    const processingTimeMs = Math.round(performance.now() - startTime);

    const newDoc: LegalDocument = {
      id: docId,
      userId: user.id,
      userName: user.name,
      filename,
      mimeType,
      fileSize: fileBuffer.length,
      pageCount: parsed.pageCount,
      status: 'ANALYZED',
      documentType,
      summary: parsed.summary,
      processingTimeMs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: text
    };

    db.createDocument(newDoc, parsed.clauses, parsed.obligations, parsed.dates);

    // Audit Log
    db.logAudit(user, 'DOCUMENT_UPLOADED', 'DOCUMENT', docId, {
      filename,
      sizeBytes: fileBuffer.length,
      pageCount: parsed.pageCount,
      processingTimeMs
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (err: any) {
    console.error('Upload processing error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process document' }, { status: 500 });
  }
}
