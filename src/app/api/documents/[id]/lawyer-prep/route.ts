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

  const documentId = params.id;
  const doc = db.getDocumentById(documentId);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && doc.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const clauses = db.getClauses(documentId);
  const obligations = db.getObligations(documentId);
  const dates = db.getDates(documentId);

  const prep = generateLawyerPrepPackage(doc, clauses, obligations, dates);

  return NextResponse.json(prep);
}
