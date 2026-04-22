'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import {
  Beaker, CheckSquare2, FolderKanban, Activity, Sparkles,
  Plus, ArrowUpRight, TrendingUp, Clock, ChevronRight,
  CheckCircle2, XCircle, Loader2, BarChart2, Target,
  Folder, Code, Layout, Database, Zap, Bot
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';

interface QAStats {
  myProjects: number;
  myTestCases: number;
  myJobs: number;
  completedJobs: number;
  pendingJobs: number;
}

const GENERATORS = [
  { label: 'Test Plan', href: '/dashboard/generators/test-plan', icon: Layout, color: 'bg-blue-50 text-blue-600', desc: 'Full enterprise QA test plan' },
  { label: 'Test Cases', href: '/dashboard/generators/test-cases', icon: Database, color: 'bg-emerald-50 text-emerald-600', desc: 'Exhaustive positive/negative cases' },
  { label: 'Code Gen', href: '/dashboard/generators/code', icon: Code, color: 'bg-violet-50 text-violet-600', desc: 'Playwright / Selenium code' },
  { label: 'Full Workflow', href: '/dashboard/generators/workflow', icon: Zap, color: 'bg-amber-50 text-amber-600', desc: 'All 3 generators in one shot' },
];

export default function QADashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getAuthUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, tcRes, jRes] = await Promise.all([
          api.get('/projects').catch(() => ({ data: [] })),
          api.get('/test-case').catch(() => ({ data: [] })),
          api.get('/jobs').catch(() => ({ data: [] })),
        ]);
        setProjects(pRes.data ?? []);
        setTestCases(tcRes.data ?? []);
        setJobs(jRes.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;
  const failedJobs = jobs.filter(j => j.status === 'FAILED').length;
  const runningJobs = jobs.filter(j => j.status === 'RUNNING').length;

  const kpis = [
    { label: 'My Projects', value: projects.length, icon: FolderKanban, color: 'bg-blue-50 text-blue-600', change: '+2 this week' },
    { label: 'Test Cases', value: testCases.length, icon: Beaker, color: 'bg-emerald-50 text-emerald-600', change: 'AI generated' },
    { label: 'Jobs Run', value: jobs.length, icon: Activity, color: 'bg-amber-50 text-amber-600', change: `${completedJobs} completed` },
    { label: 'AI Success Rate', value: jobs.length > 0 ? `${Math.round((completedJobs / jobs.length) * 100)}%` : '—', icon: Target, color: 'bg-violet-50 text-violet-600', change: 'Overall' },
  ];

  const statusColorDot: Record<string, string> = {
    COMPLETED: 'bg-emerald-500',
    FAILED: 'bg-red-500',
    RUNNING: 'bg-blue-500 animate-pulse',
    PENDING: 'bg-slate-300',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-black uppercase tracking-[0.2em] mb-2">
            <Sparkles className="w-4 h-4" /> QA Engineer Workspace
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'QA Engineer'}! 👋
          </h1>
          <p className="text-blue-100 mt-2 font-medium">
            Your AI-powered testing workspace is ready. Start generating or review your projects.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/dashboard/generators/workflow">
              <Button className="bg-white text-primary font-bold hover:bg-white/90 shadow-lg">
                <Zap className="w-4 h-4 mr-2" /> Quick Generate
              </Button>
            </Link>
            <Link href="/dashboard/projects">
              <Button variant="outline" className="border-white/30 text-white font-bold hover:bg-white/10">
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', kpi.color)}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">
                {loading ? <span className="inline-block w-10 h-8 bg-slate-100 rounded animate-pulse" /> : kpi.value}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-8">
          {/* AI Generators Panel */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" /> AI Generators
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {GENERATORS.map(g => (
                <Link key={g.href} href={g.href}>
                  <Card className="border-none shadow-sm hover:shadow-xl transition-all group cursor-pointer overflow-hidden h-full">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform', g.color)}>
                        <g.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 group-hover:text-primary transition-colors">{g.label}</h3>
                        <p className="text-xs text-slate-500 mt-1">{g.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* My Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">My Projects</h2>
              <Link href="/dashboard/projects">
                <Button variant="outline" size="sm" className="font-bold text-xs border-slate-200 gap-1">
                  View All <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : projects.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-200 bg-transparent py-12 text-center">
                <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No projects yet.</p>
                <Link href="/dashboard/projects">
                  <Button size="sm" className="mt-4 font-bold"><Plus className="w-4 h-4 mr-2" />Create First Project</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {projects.slice(0, 4).map(p => (
                  <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                    <Card className="border shadow-sm hover:shadow-md transition-all group cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <Folder className="w-5 h-5 text-primary group-hover:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{p._count?.userStories || 0} stories</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Job Activity */}
        <div className="space-y-6">
          {/* Job Summary Pills */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Job Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Done', count: completedJobs, color: 'bg-emerald-50 text-emerald-700' },
                  { label: 'Failed', count: failedJobs, color: 'bg-red-50 text-red-700' },
                  { label: 'Running', count: runningJobs, color: 'bg-blue-50 text-blue-700' },
                ].map(s => (
                  <div key={s.label} className={cn('rounded-xl p-3 text-center', s.color)}>
                    <p className="text-2xl font-black">{loading ? '—' : s.count}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                  ))
                ) : jobs.slice(0, 8).map(j => (
                  <div key={j.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', statusColorDot[j.status])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 capitalize truncate">{j.type?.replace(/_/g, ' ')?.toLowerCase()}</p>
                      <p className="text-[10px] text-slate-400">{new Date(j.createdAt).toLocaleTimeString()}</p>
                    </div>
                    {j.status === 'RUNNING' && (
                      <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <Link href="/dashboard/jobs" className="block text-center text-[10px] font-bold text-primary hover:underline pt-3 uppercase tracking-widest">
                View All Jobs →
              </Link>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] flex-shrink-0">1</span>
                <p>Import Jira issues in any generator to generate AI-powered test plans instantly.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] flex-shrink-0">2</span>
                <p>Use <strong>Full Workflow</strong> to get test plan + cases + code in one step.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] flex-shrink-0">3</span>
                <p>Configure a Groq API key in Settings for blazing-fast AI generation (free tier).</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
