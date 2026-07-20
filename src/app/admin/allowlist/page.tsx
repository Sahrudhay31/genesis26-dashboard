'use client';
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';

export default function AllowlistPage() {
  const [allowlist, setAllowlist] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchAllowlist = async () => {
    try {
      const res = await fetch('/api/admin/allowlist');
      const data = await res.json();
      if (data.allowlist) setAllowlist(data.allowlist);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowlist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setAdding(true);
    setError('');

    try {
      const res = await fetch('/api/admin/allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add');
      
      setNewEmail('');
      await fetchAllowlist();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email}? They won't be able to sign up.`)) return;
    
    try {
      const res = await fetch('/api/admin/allowlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        await fetchAllowlist();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 rounded-full border-4 border-red-900/50 border-t-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-red-500" />
          Manage Allowlist
        </h1>
        <p className="text-gray-400">Only emails on this list can register for the Genesis Portal.</p>
      </div>

      <div className="bg-[#12121A] border border-gray-800 rounded-xl overflow-hidden shadow-lg p-6">
        <form onSubmit={handleAdd} className="flex gap-4 mb-8">
          <div className="flex-1">
            <input 
              type="email" 
              required
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="w-full bg-[#1A1A24] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder="new.recruit@example.com"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <button 
            type="submit" 
            disabled={adding}
            className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-6 py-2.5 transition-colors disabled:opacity-50 flex items-center gap-2 h-[46px]"
          >
            {adding ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Email
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-[#0B0B12] border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">Email Address</th>
                <th className="px-4 py-3 font-medium">Added On</th>
                <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allowlist.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No emails in the allowlist yet.
                  </td>
                </tr>
              ) : (
                allowlist.map((entry, idx) => (
                  <tr key={entry.id} className={`hover:bg-gray-800/30 transition-colors ${idx !== allowlist.length - 1 ? 'border-b border-gray-800/50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-300">
                      {entry.email}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleRemove(entry.email)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
