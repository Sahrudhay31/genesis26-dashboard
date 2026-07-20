'use client';
import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function AdminTable({ recruits, tasks }: { recruits: any[], tasks: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = recruits.filter(r => r.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-[#12121A] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0B0B12]">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          Recruit Roster
          <span className="bg-red-900/50 text-red-400 text-xs py-0.5 px-2 rounded-full">{recruits.length}</span>
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search by email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#1A1A24] border border-gray-700 text-sm text-white rounded-md pl-9 p-1.5 focus:ring-1 focus:ring-red-500 outline-none w-64"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="text-xs text-gray-500 uppercase bg-[#0B0B12] border-b border-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium">Recruit</th>
              {tasks.map(t => (
                <th key={t.id} className="px-4 py-3 font-medium whitespace-nowrap text-center">
                  <span title={t.title}>T{t.number}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={tasks.length + 1} className="px-4 py-8 text-center text-gray-500">
                  {search ? 'No recruits found matching search.' : 'No recruits webbed up yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((recruit, idx) => (
                <tr 
                  key={recruit.id} 
                  onClick={() => router.push(`/admin/recruit/${recruit.id}`)}
                  className={`cursor-pointer hover:bg-gray-800/50 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-800/50' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-300">
                    {recruit.email}
                  </td>
                  {tasks.map(t => {
                    const statusRecord = recruit.TaskStatus.find((ts: any) => ts.task_id === t.id);
                    const status = statusRecord ? statusRecord.status : 'not_started';
                    return (
                      <td key={t.id} className="px-4 py-3 text-center">
                        <StatusBadge status={status} />
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
