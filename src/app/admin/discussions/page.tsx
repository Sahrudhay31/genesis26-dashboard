'use client';
import React, { useEffect, useState } from 'react';
import { MessageSquare, Search, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

interface DoubtItem {
  id: string;
  task_id: string;
  recruit_id: string;
  author_id: string;
  author_email: string;
  content: string;
  created_at: string;
  task: {
    number: number;
    title: string;
  };
  recruit: {
    email: string;
  };
  author: {
    role: string;
  };
}

export default function AdminDiscussionsPage() {
  const [doubts, setDoubts] = useState<DoubtItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/discussions')
      .then((res) => res.json())
      .then((data) => {
        if (data.doubts) {
          setDoubts(data.doubts);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredDoubts = doubts.filter((d) => {
    const query = searchQuery.toLowerCase();
    return (
      d.recruit.email.toLowerCase().includes(query) ||
      d.author_email.toLowerCase().includes(query) ||
      d.task.title.toLowerCase().includes(query) ||
      `task ${d.task.number}`.includes(query) ||
      d.content.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 rounded-full border-4 border-red-900/50 border-t-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-red-500" />
            Global discussions
          </h1>
          <p className="text-gray-400">View and manage all doubts/replies across all recruits.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recruit, task, or content..."
            className="w-full bg-[#12121A] border border-gray-800 text-xs text-white rounded-lg pl-9 pr-4 py-2.5 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none placeholder-gray-600"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredDoubts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border border-gray-800 border-dashed rounded-xl bg-[#12121A]/20">
            {searchQuery ? 'No discussions match your search query.' : 'No discussions have been started yet.'}
          </div>
        ) : (
          filteredDoubts.map((doubt) => {
            const isAuthorAdmin = doubt.author?.role === 'admin';
            return (
              <div
                key={doubt.id}
                className="bg-[#12121A] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700/80 transition-all shadow-lg p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-gray-400 bg-gray-800/40 px-2 py-0.5 rounded">
                      <User className="w-3 h-3 text-red-400" />
                      Recruit: {doubt.recruit.email}
                    </span>
                    <span className="text-red-500 font-mono">
                      #{doubt.task.number} - {doubt.task.title}
                    </span>
                    <span className="text-gray-500 text-[10px]">
                      {new Date(doubt.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="bg-[#0B0B12]/80 border border-gray-800/60 rounded-lg p-3 relative">
                    <div className="flex justify-between items-center mb-1 text-[10px]">
                      <span className={`font-semibold ${isAuthorAdmin ? 'text-red-400' : 'text-gray-300'}`}>
                        {doubt.author_email}
                        {isAuthorAdmin && (
                          <span className="ml-1.5 px-1 py-0.2 bg-red-600 text-white rounded text-[8px] font-bold uppercase tracking-wider">
                            Panel (You)
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 whitespace-pre-wrap mt-1 leading-relaxed">{doubt.content}</p>
                  </div>
                </div>

                <div className="md:self-center shrink-0">
                  <Link
                    href={`/admin/recruit/${doubt.recruit_id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 font-semibold transition-colors bg-red-950/20 hover:bg-red-950/40 px-3.5 py-2 rounded-lg border border-red-900/30 cursor-pointer"
                  >
                    Reply in Thread
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
