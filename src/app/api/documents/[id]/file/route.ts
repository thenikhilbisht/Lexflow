import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const docId = params.id;
    const document = db.getDocumentById(docId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check authorization: admin or owner
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && document.userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 1. Check disk file first
    const diskPath = path.join(UPLOADS_DIR, `${docId}.pdf`);
    if (fs.existsSync(diskPath)) {
      const fileBuffer = fs.readFileSync(diskPath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': document.mimeType || 'application/pdf',
          'Content-Disposition': `inline; filename="${encodeURIComponent(document.filename)}"`,
          'Cache-Control': 'private, max-age=3600'
        }
      });
    }

    // 2. Fallback: if raw PDF content is stored in document.content
    if (document.content && document.content.startsWith('%PDF-')) {
      const buf = Buffer.from(document.content, 'binary');
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${encodeURIComponent(document.filename)}"`,
          'Cache-Control': 'private, max-age=3600'
        }
      });
    }

    // 3. Fallback for text/docx: return clean text buffer
    const textBuf = Buffer.from(document.content || '', 'utf8');
    return new NextResponse(textBuf, {
      headers: {
        'Content-Type': document.mimeType || 'text/plain; charset=utf-8',
        'Content-Disposition': `inline; filename="${encodeURIComponent(document.filename)}"`
      }
    });
  } catch (err: any) {
    console.error('File serving error:', err);
    return NextResponse.json({ error: 'Failed to serve document file' }, { status: 500 });
  }
}
