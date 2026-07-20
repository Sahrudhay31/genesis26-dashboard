import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { SpideyHeader } from '@/components/ui/SpideyHeader';
import Link from 'next/link';
import { Users, ShieldCheck, MessageSquare } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#0B0B12]">
      <SpideyHeader title="Panel Dashboard" user={session} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-2 sticky top-24">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors">
              <Users className="w-5 h-5 text-red-500" />
              Recruit Roster
            </Link>
            <Link href="/admin/allowlist" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              Manage Allowlist
            </Link>
            <Link href="/admin/discussions" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors">
              <MessageSquare className="w-5 h-5 text-red-500" />
              Discussions
            </Link>
          </nav>
        </aside>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
