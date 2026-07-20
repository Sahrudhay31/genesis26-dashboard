import React from 'react';

type Status = 'not_started' | 'in_progress' | 'stuck' | 'finished' | 'skipped';

const statusConfig: Record<Status, { label: string; bg: string; text: string }> = {
  not_started: { label: 'Not Started', bg: 'bg-gray-800', text: 'text-gray-300' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-900', text: 'text-blue-200' },
  stuck: { label: 'Stuck', bg: 'bg-red-900', text: 'text-red-200' },
  finished: { label: 'Finished', bg: 'bg-green-900', text: 'text-green-200' },
  skipped: { label: 'Skipped', bg: 'bg-yellow-900', text: 'text-yellow-200' },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border border-opacity-20 ${
      status === 'stuck' ? 'border-red-500 animate-pulse' : 'border-transparent'
    }`}>
      {config.label}
    </span>
  );
}
