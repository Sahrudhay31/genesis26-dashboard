import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { ExternalLink, Save, CheckCircle2, MessageSquare, Send } from 'lucide-react';

export type TaskStatus = 'not_started' | 'in_progress' | 'stuck' | 'finished' | 'skipped';
export type Verdict = 'pending' | 'approved' | 'needs_revision';

export interface TaskData {
  id: string;
  number: number;
  title: string;
  description: string;
  resources: string | null;
  status: TaskStatus;
  submission_link: string | null;
  submission_note: string | null;
  verdict: Verdict;
  admin_comment: string | null;
}

export function TaskCard({ task, onUpdate }: { task: TaskData, onUpdate: (taskId: string, status: TaskStatus, link: string, note: string) => Promise<void> }) {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [link, setLink] = useState(task.submission_link || '');
  const [note, setNote] = useState(task.submission_note || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Doubts and discussions thread state
  const [showDoubts, setShowDoubts] = useState(false);
  const [doubts, setDoubts] = useState<{ id: string, author_email: string, content: string, created_at: string, author: { role: string } }[]>([]);
  const [newDoubt, setNewDoubt] = useState('');
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [postingDoubt, setPostingDoubt] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await onUpdate(task.id, status, link, note);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fetchDoubts = async () => {
    setLoadingDoubts(true);
    try {
      const res = await fetch(`/api/doubts?taskId=${task.id}`);
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
        body: JSON.stringify({ taskId: task.id, content: newDoubt }),
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

  const parsedResources = task.resources 
    ? (JSON.parse(task.resources) as { name: string, url: string }[]) 
    : [];

  return (
    <div className="bg-[#12121A] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors shadow-lg flex flex-col justify-between">
      <div>
        <div className="p-5 border-b border-gray-800">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-mono text-sm">#{task.number}</span>
              <h3 className="text-lg font-bold text-white">{task.title}</h3>
            </div>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-gray-400">{task.description}</p>
        </div>
        
        <div className="p-5 space-y-4">
          {parsedResources.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Training Resources</label>
              <div className="flex flex-wrap gap-2">
                {parsedResources.map((res, index) => (
                  <a
                    key={index}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 bg-[#1A1A24] text-red-400 border border-red-900/30 hover:border-red-500/50 hover:bg-red-950/20 px-2.5 py-1 rounded-md transition-colors text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {res.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full bg-[#1A1A24] border border-gray-700 text-sm text-white rounded-md p-2 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="stuck">Stuck (Need Help)</option>
              <option value="finished">Finished</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Submission Link (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                type="url" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-[#1A1A24] border border-gray-700 text-sm text-white rounded-md pl-9 p-2 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none placeholder-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Note for Panel (Optional)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="I got stuck on step 3..."
              rows={2}
              className="w-full bg-[#1A1A24] border border-gray-700 text-sm text-white rounded-md p-2 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none placeholder-gray-600 resize-none"
            />
          </div>

          {task.admin_comment && (
            <div className={`p-3 rounded-md text-sm border ${
              task.verdict === 'approved' ? 'bg-green-900/20 border-green-800/50 text-green-200' : 
              task.verdict === 'needs_revision' ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-200' : 
              'bg-gray-800/50 border-gray-700 text-gray-300'
            }`}>
              <span className="font-semibold block mb-1">
                Panel Review ({task.verdict.replace('_', ' ').toUpperCase()}):
              </span>
              {task.admin_comment}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save Status'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-gray-800 bg-[#0E0E14]">
        <button
          onClick={toggleDoubts}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider py-1 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-red-500" />
            Doubts & Discussions {doubts.length > 0 && `(${doubts.length})`}
          </span>
          <span>{showDoubts ? 'Hide Thread' : 'Show Thread'}</span>
        </button>

        {showDoubts && (
          <div className="pt-4 space-y-4">
            {loadingDoubts ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 rounded-full border-2 border-red-900/30 border-t-red-500 animate-spin" />
              </div>
            ) : (
              <>
                <div className="max-h-48 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                  {doubts.length === 0 ? (
                    <p className="text-xs text-gray-500 italic text-center py-2">No doubts asked yet. Be the first to start the thread!</p>
                  ) : (
                    doubts.map((d) => {
                      const isAdmin = d.author?.role === 'admin';
                      return (
                        <div 
                          key={d.id} 
                          className={`p-2.5 rounded-lg border text-xs ${
                            isAdmin 
                              ? 'bg-red-950/20 border-red-900/40 text-red-100' 
                              : 'bg-[#161622] border-gray-800 text-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`font-semibold ${isAdmin ? 'text-red-400' : 'text-gray-400'}`}>
                              {d.author_email}
                              {isAdmin && (
                                <span className="ml-1.5 px-1 py-0.5 text-[8px] bg-red-600 text-white rounded font-bold uppercase tracking-wider">
                                  Panel
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
                    placeholder="Ask a doubt or reply..."
                    disabled={postingDoubt}
                    className="flex-1 bg-[#1A1A24] border border-gray-700 text-xs text-white rounded-md px-3 py-1.5 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none placeholder-gray-600"
                  />
                  <button
                    type="submit"
                    disabled={postingDoubt || !newDoubt.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-md transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
                  >
                    {postingDoubt ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
    </div>
  );
}
