import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const doubts = await prisma.doubt.findMany({
      where: {
        task_id: taskId
      },
      include: {
        author: {
          select: { role: true }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    return NextResponse.json({ doubts });
  } catch (error) {
    console.error('Fetch doubts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, content, recruitId: reqRecruitId } = await request.json();

    if (!taskId || !content) {
      return NextResponse.json({ error: 'Task ID and content are required' }, { status: 400 });
    }

    let recruitId = reqRecruitId;
    if (session.role === 'recruit') {
      recruitId = session.id;
    }

    if (!recruitId) {
      return NextResponse.json({ error: 'Recruit ID is required' }, { status: 400 });
    }

    // Fetch the task details to include in notification messages
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });
    const taskName = task ? `Task ${task.number}` : 'a task';

    // Create the doubt
    const doubt = await prisma.doubt.create({
      data: {
        task_id: taskId,
        recruit_id: recruitId,
        author_id: session.id,
        author_email: session.email,
        content
      },
      include: {
        author: {
          select: { role: true }
        }
      }
    });

    // Create notifications
    if (session.role === 'recruit') {
      // Notify all admins
      const admins = await prisma.user.findMany({
        where: { role: 'admin' }
      });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            user_id: admin.id,
            title: `New Doubt on ${taskName}`,
            message: `${session.email} asked: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
            link: `/admin/recruit/${session.id}`
          }
        });
      }
    } else if (session.role === 'admin') {
      // Notify the recruit
      await prisma.notification.create({
        data: {
          user_id: recruitId,
          title: `Panel replied to ${taskName}`,
          message: `The panel replied to your doubt: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
          link: '/dashboard'
        }
      });
    }

    return NextResponse.json({ doubt });
  } catch (error) {
    console.error('Create doubt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
