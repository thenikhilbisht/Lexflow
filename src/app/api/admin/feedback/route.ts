import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { UserFeedback } from '@/types';

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(db.feedback);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messageId, rating, reason, comments } = body;

    const user = await getSessionUser();
    const newFeedback: UserFeedback = {
      id: `fb-${Date.now()}`,
      userId: user?.id || 'usr-anonymous',
      userEmail: user?.email || 'anonymous@lexiguide.com',
      messageId: messageId || 'msg-unknown',
      rating: rating === 'UNHELPFUL' ? 'UNHELPFUL' : 'HELPFUL',
      reason: reason || undefined,
      comments: comments || undefined,
      createdAt: new Date().toISOString()
    };

    db.feedback.unshift(newFeedback);
    db.save();
    return NextResponse.json(newFeedback, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
