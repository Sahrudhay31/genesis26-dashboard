'use client';
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface Doubt {
  id: string;
  author_email: string;
  content: string;
  created_at: string;
  author: { role: string };
}

export default function AdminDoubtThread({ taskId, recruitId }: { taskId: string, recruitId: string }) {
  const [showDoubts, setShowDoubts] = useState(false);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [newDoubt, setNewDoubt] = useState('');
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [postingDoubt, setPostingDoubt] = useState(false);

  const fetchDoubts = async () => {
    setLoadingDoubts(true);
    try {
      const res = await fetch(`/api/doubts?taskId=${taskId}&recruitId=${recruitId}`);
      if (res.ok) {
        const data = await res.json();
        setDoubts(data.doubts);
      }
    } catch (err) {
      console.error('Error fetching doubts:', err);
    } finally {
      setLoadingDoubts(false);
    }
  };

  const toggleDoubts = () => {
    const nextShow = !showDoubts;
    setShowDoubts(nextShow);
    if (nextShow) {
      fetchDoubts();
    }
  };

  const handlePostDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubt.trim()) return;

    setPostingDoubt(true);
    try {
      const res = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, content: newDoubt, recruitId }),
      });
      if (res.ok) {
        const data = await res.json();
        setDoubts([...doubts, data.doubt]);
        setNewDoubt('');
      }
    } catch (err) {
      console.error('Error posting doubt:', err);
    } finally {
      setPostingDoubt(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-800/60 pt-4 bg-[#14141E]/40 p-4 rounded-lg">
      <button
        onClick={toggleDoubts}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-red-500" />
          Recruit Doubts & Discussions {doubts.length > 0 && `(${doubts.length})`}
        </span>
        <span>{showDoubts ? 'Hide Discussion' : 'View Discussion'}</span>
      </button>

      {showDoubts && (
        <div className="mt-4 space-y-4">
          {loadingDoubts ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 rounded-full border-2 border-red-900/30 border-t-red-500 animate-spin" />
            </div>
          ) : (
            <>
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {doubts.length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-2">No doubts or comments for this task yet.</p>
                ) : (
                  doubts.map((d) => {
                    const isCurrentUserAdmin = d.author?.role === 'admin';
                    return (
                      <div
                        key={d.id}
                        className={`p-3 rounded-lg border text-xs ${
                          isCurrentUserAdmin
                            ? 'bg-red-950/20 border-red-900/40 text-red-100'
                            : 'bg-[#1E1E2C] border-gray-800 text-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-semibold ${isCurrentUserAdmin ? 'text-red-400' : 'text-gray-400'}`}>
                            {d.author_email}
                            {isCurrentUserAdmin && (
                              <span className="ml-1.5 px-1 py-0.5 text-[8px] bg-red-600 text-white rounded font-bold uppercase tracking-wider">
                                Panel (You)
                              </span>
                            )}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            {new Date(d.created_at).toLocaleDateString(undefined, { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{d.content}</p>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handlePostDoubt} className="flex gap-2">
                <input
                  type="text"
                  value={newDoubt}
                  onChange={(e) => setNewDoubt(e.target.value)}
                  placeholder="Post a reply as Panel..."
                  disabled={postingDoubt}
                  className="flex-1 bg-[#1A1A24] border border-gray-700 text-xs text-white rounded-md px-3 py-2 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none placeholder-gray-600"
                />
                <button
                  type="submit"
                  disabled={postingDoubt || !newDoubt.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                  {postingDoubt ? (
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
