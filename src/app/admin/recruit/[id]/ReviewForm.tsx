'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CheckCircle2 } from 'lucide-react';

export default function ReviewForm({ 
  statusId, 
  initialVerdict, 
  initialComment 
}: { 
  statusId: string, 
  initialVerdict: 'pending' | 'approved' | 'needs_revision',
  initialComment: string 
}) {
  const router = useRouter();
  const [verdict, setVerdict] = useState(initialVerdict);
  const [comment, setComment] = useState(initialComment);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId, verdict, comment }),
      });
      
      if (!res.ok) throw new Error('Failed to save review');
      
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Verdict</label>
        <select 
          value={verdict} 
          onChange={(e) => setVerdict(e.target.value as any)}
          className="w-full bg-[#12121A] border border-gray-700 text-sm text-white rounded-md p-2 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="needs_revision">Needs Revision</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Feedback Comment</label>
        <textarea 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Great job! Or, you need to fix..."
          rows={3}
          className="w-full bg-[#12121A] border border-gray-700 text-sm text-white rounded-md p-2 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none placeholder-gray-600 resize-none"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 border border-gray-600"
        >
          {saving ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save Review'}
        </button>
      </div>
    </div>
  );
}
