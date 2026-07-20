import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recruits = await prisma.user.findMany({
      where: { role: 'recruit' },
      select: {
        id: true,
        email: true,
        TaskStatus: true,
      },
      orderBy: {
        email: 'asc'
      }
    });

    const tasks = await prisma.task.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ recruits, tasks });
  } catch (error) {
    console.error('Admin recruits fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
