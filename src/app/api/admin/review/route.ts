import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { statusId, verdict, comment } = await request.json();

    if (!statusId || !verdict) {
      return NextResponse.json({ error: 'Status ID and verdict are required' }, { status: 400 });
    }

    await prisma.taskStatus.update({
      where: { id: statusId },
      data: {
        verdict,
        admin_comment: comment || null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
