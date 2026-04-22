'use client';

import { Crown, Lock, Zap, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { type TrialStatus } from '@/hooks/useSubscription';

interface ProGateProps {
  /** Current trial/subscription status */
  status: TrialStatus;
  loading?: boolean;
  /** If provided, shows "1 of 1 free use remaining" style indicator */
  showTrialBadge?: boolean;
  children: React.ReactNode;
}

/**
 * ProGate — wraps any AI generator.
 * - UNLIMITED / PRO / ENTERPRISE / FREE_TRIAL_AVAILABLE → shows children
 * - FREE_TRIAL_EXHAUSTED → shows upgrade wall
 * - UNKNOWN / loading → shows spinner
 */
export default function ProGate({ status, loading, showTrialBadge, children }: ProGateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
      </div>
    );
  }

  if (status === 'FREE_TRIAL_EXHAUSTED') {
    return (
      <div className="space-y-6">
        {/* Upgrade Wall */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          <div className="relative space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Free Trial Used</h2>
              <p className="text-slate-400 mt-2 max-w-md mx-auto text-sm leading-relaxed">
                You've used your one free AI generation. Upgrade to <strong className="text-white">Pro</strong> to get unlimited test plans, test cases, and automation code.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
              {[
                'Unlimited AI generations',
                'All 4 generator types',
                'Jira integration',
                'PDF & code export',
                'Priority AI engine',
                'Full workflow generation',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/pricing">
                <Button className="font-black bg-primary hover:bg-primary/90 h-12 px-8 text-base gap-2 shadow-lg shadow-primary/30">
                  <Crown className="w-5 h-5" /> Upgrade to Pro — ₹3,999/mo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="font-bold h-12 px-6 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                  View All Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Free trial indicator badge */}
      {showTrialBadge && status === 'FREE_TRIAL_AVAILABLE' && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-800">Free Trial — 1 generation available</p>
            <p className="text-[10px] text-amber-600">After this generation, you'll need to upgrade to Pro.</p>
          </div>
          <Link href="/pricing">
            <Button size="sm" className="h-7 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white border-0">
              View Pro Plans
            </Button>
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}
