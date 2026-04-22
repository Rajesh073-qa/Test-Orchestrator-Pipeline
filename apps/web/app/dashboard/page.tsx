'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

/**
 * Smart dashboard router — redirects to role-specific dashboard.
 * ADMIN → /dashboard/admin
 * QA / USER → /dashboard/qa
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'ADMIN') {
      router.replace('/dashboard/admin');
    } else {
      router.replace('/dashboard/qa');
    }
  }, [router]);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <p className="text-slate-400 font-medium">Loading your workspace...</p>
      </div>
    </div>
  );
}
