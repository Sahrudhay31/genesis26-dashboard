'use client';
import React, { useEffect, useState } from 'react';
import { AdminTable } from '@/components/ui/AdminTable';

export default function AdminOverviewPage() {
  const [data, setData] = useState<{ recruits: any[], tasks: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/recruits')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 rounded-full border-4 border-red-900/50 border-t-red-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Recruit Overview</h1>
        <p className="text-gray-400">Monitor progress and identify stuck recruits.</p>
      </div>

      <AdminTable recruits={data.recruits} tasks={data.tasks} />
    </div>
  );
}
