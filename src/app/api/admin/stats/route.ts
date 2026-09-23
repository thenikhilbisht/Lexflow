import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const realStats = db.getRealStats();

  return NextResponse.json({
    totalUsers: realStats.totalUsers,
    activeUsersCount: realStats.activeUsersCount,
    totalDocuments: realStats.totalDocuments,
    aiRequests: realStats.aiRequests,
    avgLatencySec: realStats.avgLatencySec,
    totalFeedback: realStats.totalFeedback,
    recentLogs: db.auditLogs.slice(0, 5),
    systemHealth: {
      api: 'Operational',
      database: 'Operational',
      documentProcessing: 'Operational',
      vectorSearch: 'Operational',
      aiProvider: 'Operational',
      storage: 'Operational'
    }
  });
}
