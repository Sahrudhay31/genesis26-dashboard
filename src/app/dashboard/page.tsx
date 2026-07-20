'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SpideyHeader } from '@/components/ui/SpideyHeader';
import { TaskCard, TaskData, TaskStatus } from '@/components/ui/TaskCard';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string, role: string } | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/task-status');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
      if (data.user) {
        setUser(data.user);
      } 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: TaskStatus, link: string, note: string) => {
    try {
      const res = await fetch('/api/task-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status, link, note }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status, submission_link: link, submission_note: note } : t));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-red-900/50 border-t-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B12]">
      <SpideyHeader title="Recruit Dashboard" user={user || undefined} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Your Training Regimen</h2>
          <p className="text-gray-400">Complete the tasks below to earn your suit. Mark any task as "Stuck" to signal the panel for help.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onUpdate={handleUpdateStatus} />
          ))}
        </div>
      </main>
    </div>
  );
}
