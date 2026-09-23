import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

import { generateLawyerPrepPackage } from '@/lib/ai/lawyer-prep';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doc = db.getDocumentById(params.id);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // Authorization check
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && doc.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden: You do not have permission to view this document.' }, { status: 403 });
  }

  const clauses = db.getClauses(params.id);
  const obligations = db.getObligations(params.id);
  const dates = db.getDates(params.id);
  const lawyerPrep = generateLawyerPrepPackage(doc, clauses, obligations, dates);

  return NextResponse.json({
    document: doc,
    clauses,
    obligations,
    dates,
    lawyerPrep
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doc = db.getDocumentById(params.id);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && doc.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this document.' }, { status: 403 });
  }

  const success = db.deleteDocument(params.id);
  if (!success) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }

  db.logAudit(user, 'DOCUMENT_DELETED', 'DOCUMENT', params.id, { filename: doc.filename });

  return NextResponse.json({ success: true, message: 'Document deleted permanently' });
}
