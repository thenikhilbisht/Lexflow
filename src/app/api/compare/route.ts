import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { compareDocuments } from '@/lib/ai/comparator';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(db.comparisons);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { docAId, docBId } = body;

    if (!docAId || !docBId) {
      return NextResponse.json({ error: 'Both docAId and docBId are required' }, { status: 400 });
    }

    const docA = db.getDocumentById(docAId);
    const docB = db.getDocumentById(docBId);

    if (!docA || !docB) {
      return NextResponse.json({ error: 'One or both documents not found in library' }, { status: 404 });
    }

    // Verify ownership or admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      if (docA.userId !== user.id || docB.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden: You do not own these documents' }, { status: 403 });
      }
    }

    const clausesA = db.getClauses(docA.id);
    const clausesB = db.getClauses(docB.id);

    const comparison = compareDocuments(docA, docB, clausesA, clausesB);

    db.comparisons.unshift(comparison);
    db.save();

    db.logAudit(user, 'DOCUMENT_COMPARED', 'COMPARISON', comparison.id, {
      docA: docA.filename,
      docB: docB.filename,
      totalChanges: comparison.summary.totalChanges
    });

    return NextResponse.json(comparison);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
