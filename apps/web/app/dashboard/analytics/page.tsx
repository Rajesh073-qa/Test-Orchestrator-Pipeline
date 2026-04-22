'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import {
  BarChart2, TrendingUp, Cpu, Clock, CheckCircle2, XCircle,
  ArrowUpRight, Calendar, Download, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AnalyticsPage = dynamic(() => Promise.resolve(function AnalyticsContent() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [jRes, tcRes, pRes] = await Promise.all([
          api.get('/jobs').catch(() => ({ data: [] })),
          api.get('/test-case').catch(() => ({ data: [] })),
          api.get('/projects').catch(() => ({ data: [] })),
        ]);
        setJobs(jRes.data ?? []);
        setTestCases(tcRes.data ?? []);
        setProjects(pRes.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Derived stats
  const completed = jobs.filter(j => j.status === 'COMPLETED').length;
  const failed = jobs.filter(j => j.status === 'FAILED').length;
  const successRate = jobs.length > 0 ? Math.round((completed / jobs.length) * 100) : 0;

  // Group jobs by type
  const typeGroups = jobs.reduce((acc: Record<string, number>, j) => {
    const t = j.type || 'Unknown';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Priority breakdown of test cases
  const prioGroups = testCases.reduce((acc: Record<string, number>, tc) => {
    const p = tc.priority || 'Unknown';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const typeColors: Record<string, string> = {
    'BULK_TEST_CASE_GENERATION': 'bg-blue-500',
    'QUICK_TEST_PLAN': 'bg-emerald-500',
    'QUICK_TEST_CASES': 'bg-violet-500',
    'QUICK_CODE': 'bg-amber-500',
    'PROJECT_EXPORT': 'bg-pink-500',
  };

  const prioColors: Record<string, string> = {
    High: 'bg-red-500',
    Medium: 'bg-amber-500',
    Low: 'bg-emerald-500',
  };

  const exportReport = () => {
    const lines = [
      'PLATFORM ANALYTICS REPORT',
      '='.repeat(50),
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'OVERVIEW',
      `Total Jobs: ${jobs.length}`,
      `Completed: ${completed}`,
      `Failed: ${failed}`,
      `Success Rate: ${successRate}%`,
      `Total Projects: ${projects.length}`,
      `Total Test Cases: ${testCases.length}`,
      '',
      'JOB BREAKDOWN',
      ...Object.entries(typeGroups).map(([t, c]) => `${t}: ${c}`),
      '',
      'TEST CASE PRIORITY',
      ...Object.entries(prioGroups).map(([p, c]) => `${p}: ${c}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'analytics_report.txt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const kpis = [
    { label: 'Total Jobs', value: jobs.length, icon: Cpu, color: 'bg-blue-50 text-blue-600' },
    { label: 'Success Rate', value: `${successRate}%`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Test Cases', value: testCases.length, icon: CheckCircle2, color: 'bg-violet-50 text-violet-600' },
    { label: 'Projects', value: projects.length, icon: BarChart2, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
            Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-1">Platform performance and AI generation metrics.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn('px-3 py-1.5 rounded-md text-xs font-bold transition-all', period === p ? 'bg-white shadow text-slate-900' : 'text-slate-500')}
              >{p}</button>
            ))}
          </div>
          <Button variant="outline" onClick={exportReport} className="font-bold border-slate-200 gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', kpi.color)}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">
                {loading ? <span className="inline-block w-12 h-8 bg-slate-100 rounded animate-pulse" /> : kpi.value}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Job Type Breakdown */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">AI Generation by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : Object.keys(typeGroups).length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No jobs yet. Start generating!</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(typeGroups)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => {
                    const pct = Math.round((count / jobs.length) * 100);
                    const label = type.replace(/_/g, ' ').toLowerCase();
                    return (
                      <div key={type} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 capitalize">{label}</span>
                          <span className="font-black text-slate-900">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all duration-700', typeColors[type] || 'bg-slate-400')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Case Priority Breakdown */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Test Case Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : testCases.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No test cases generated yet.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(prioGroups).map(([prio, count]) => {
                  const pct = Math.round((count / testCases.length) * 100);
                  return (
                    <div key={prio} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-3 h-3 rounded-full', prioColors[prio] || 'bg-slate-400')} />
                          <span className="font-bold text-slate-700">{prio}</span>
                        </div>
                        <span className="font-black text-slate-900">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-700', prioColors[prio] || 'bg-slate-400')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t mt-4 grid grid-cols-3 text-center">
                  {Object.entries(prioGroups).map(([p, c]) => (
                    <div key={p}>
                      <p className="text-2xl font-black text-slate-900">{c}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Success vs Failure */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Job Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-32 bg-slate-100 rounded animate-pulse" />
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Completed', count: completed, color: 'bg-emerald-500', text: 'text-emerald-600' },
                  { label: 'Failed', count: failed, color: 'bg-red-500', text: 'text-red-600' },
                  { label: 'Pending', count: jobs.filter(j => j.status === 'PENDING').length, color: 'bg-slate-300', text: 'text-slate-500' },
                  { label: 'Running', count: jobs.filter(j => j.status === 'RUNNING').length, color: 'bg-blue-500', text: 'text-blue-600' },
                ].map(s => {
                  const pct = jobs.length > 0 ? Math.round((s.count / jobs.length) * 100) : 0;
                  return (
                    <div key={s.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn('font-bold', s.text)}>{s.label}</span>
                        <span className="font-black text-slate-900">{s.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', s.color)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Job Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4 max-h-64 overflow-auto">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-50 rounded animate-pulse" />
                ))
              ) : jobs.slice(0, 10).map((j, idx) => (
                <div key={j.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn('w-3 h-3 rounded-full flex-shrink-0', {
                      'bg-emerald-500': j.status === 'COMPLETED',
                      'bg-red-500': j.status === 'FAILED',
                      'bg-blue-500': j.status === 'RUNNING',
                      'bg-slate-300': j.status === 'PENDING',
                    })} />
                    {idx < jobs.slice(0, 10).length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-bold text-slate-700 capitalize">{j.type?.replace(/_/g, ' ')?.toLowerCase()}</p>
                    <p className="text-[10px] text-slate-400">{new Date(j.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}), { ssr: false });

export default AnalyticsPage;
