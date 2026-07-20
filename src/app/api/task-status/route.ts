import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruit') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      orderBy: { order: 'asc' }
    });

    let statuses = await prisma.taskStatus.findMany({
      where: { user_id: session.id }
    });

    // Auto-create missing task statuses
    if (statuses.length < tasks.length) {
      const existingTaskIds = new Set(statuses.map(s => s.task_id));
      const missingTasks = tasks.filter(t => !existingTaskIds.has(t.id));
      
      for (const t of missingTasks) {
        await prisma.taskStatus.create({
          data: {
            user_id: session.id,
            task_id: t.id,
            status: 'not_started'
          }
        });
      }
      
      statuses = await prisma.taskStatus.findMany({
        where: { user_id: session.id }
      });
    }

    // Join tasks with statuses
    const data = tasks.map(task => {
      const status = statuses.find(s => s.task_id === task.id);
      return {
        ...task,
        status: status?.status || 'not_started',
        submission_link: status?.submission_link || '',
        submission_note: status?.submission_note || '',
        verdict: status?.verdict || 'pending',
        admin_comment: status?.admin_comment || ''
      };
    });

    return NextResponse.json({ tasks: data, user: { email: session.email, role: session.role } });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruit') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, status, link, note } = await request.json();

    if (!taskId || !status) {
      return NextResponse.json({ error: 'Task ID and status are required' }, { status: 400 });
    }

    await prisma.taskStatus.update({
      where: {
        user_id_task_id: {
          user_id: session.id,
          task_id: taskId
        }
      },
      data: {
        status,
        submission_link: link || null,
        submission_note: note || null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
