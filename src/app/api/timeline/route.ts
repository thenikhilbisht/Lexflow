import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { ExtractedDate } from '@/types';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userDocs = (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
    ? db.documents
    : db.getDocumentsForUser(user.id);

  const allDates: (ExtractedDate & { docName: string })[] = [];

  for (const doc of userDocs) {
    const dates = db.getDates(doc.id);
    for (const d of dates) {
      allDates.push({
        ...d,
        docName: doc.filename
      });
    }
  }

  // Sort by isoDate or dateStr
  allDates.sort((a, b) => (a.isoDate || a.dateStr).localeCompare(b.isoDate || b.dateStr));

  return NextResponse.json(allDates);
}
