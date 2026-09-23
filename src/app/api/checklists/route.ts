import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Obligation } from '@/types';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userDocs = (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
    ? db.documents
    : db.getDocumentsForUser(user.id);

  const allObligations: (Obligation & { docName: string })[] = [];

  for (const doc of userDocs) {
    const obligations = db.getObligations(doc.id);
    for (const ob of obligations) {
      allObligations.push({
        ...ob,
        docName: doc.filename
      });
    }
  }

  return NextResponse.json(allObligations);
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Obligation ID is required' }, { status: 400 });
    }

    const success = db.toggleObligation(id);
    if (!success) {
      return NextResponse.json({ error: 'Obligation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
