'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SpideyHeader } from '@/components/ui/SpideyHeader';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      router.push(data.redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B12] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-[#0B0B12] to-[#0B0B12]">
      <SpideyHeader title="Recruitment Tracker" />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-md bg-[#12121A] border border-gray-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Subtle web pattern hint */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
              <path d="M50 0v100M0 50h100M14.6 14.6l70.8 70.8M85.4 14.6L14.6 85.4M25 50a25 25 0 0 0 50 0a25 25 0 0 0 -50 0M10 50a40 40 0 0 0 80 0a40 40 0 0 0 -80 0" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
          </div>

          <div className="text-center mb-8 relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to track your web-slinging progress</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-pulse">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#1A1A24] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="peter.parker@dailybugle.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#1A1A24] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-3 transition-colors disabled:opacity-50 mt-4 shadow-lg shadow-red-900/20"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400 relative z-10">
            New recruit?{' '}
            <Link href="/signup" className="text-red-500 hover:text-red-400 font-medium transition-colors">
              Suit up here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
