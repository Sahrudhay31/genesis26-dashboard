import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doubts = await prisma.doubt.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        task: {
          select: { number: true, title: true }
        },
        recruit: {
          select: { email: true }
        },
        author: {
          select: { role: true }
        }
      }
    });

    return NextResponse.json({ doubts });
  } catch (error) {
    console.error('Fetch admin discussions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
