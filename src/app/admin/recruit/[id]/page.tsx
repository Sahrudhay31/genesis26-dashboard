import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExternalLink } from 'lucide-react';
import ReviewForm from './ReviewForm';
import AdminDoubtThread from './AdminDoubtThread';

export default async function RecruitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const recruit = await prisma.user.findUnique({
    where: { id, role: 'recruit' },
    include: {
      TaskStatus: {
        include: { task: true },
        orderBy: { task: { order: 'asc' } }
      }
    }
  });

  if (!recruit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{recruit.email}</h1>
        <p className="text-gray-400">Recruit Submission Details</p>
      </div>

      <div className="space-y-6">
        {recruit.TaskStatus.map((ts: any) => (
          <div key={ts.id} className="bg-[#12121A] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0B0B12]">
              <div className="flex items-center gap-3">
                <span className="text-red-500 font-mono text-sm">#{ts.task.number}</span>
                <h3 className="text-lg font-bold text-white">{ts.task.title}</h3>
              </div>
              <StatusBadge status={ts.status as any} />
            </div>
            
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Submission Link</label>
                  {ts.submission_link ? (
                    <a href={ts.submission_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      <span className="break-all">{ts.submission_link}</span>
                    </a>
                  ) : (
                    <span className="text-gray-600 italic">No link provided</span>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Recruit's Note</label>
                  {ts.submission_note ? (
                    <p className="text-gray-300 bg-[#1A1A24] p-3 rounded-md text-sm border border-gray-800">{ts.submission_note}</p>
                  ) : (
                    <span className="text-gray-600 italic">No note provided</span>
                  )}
                </div>
              </div>

              <div className="bg-[#1A1A24] rounded-lg p-4 border border-gray-800">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  Panel Review
                </h4>
                <ReviewForm 
                  statusId={ts.id} 
                  initialVerdict={ts.verdict as any} 
                  initialComment={ts.admin_comment || ''} 
                />
              </div>
            </div>

            <div className="px-5 pb-5">
              <AdminDoubtThread taskId={ts.task.id} recruitId={recruit.id} />
            </div>
          </div>
        ))}

        {recruit.TaskStatus.length === 0 && (
          <div className="p-12 text-center text-gray-500 border border-gray-800 border-dashed rounded-xl">
            This recruit hasn't opened their dashboard yet.
          </div>
        )}
      </div>
    </div>
  );
}
