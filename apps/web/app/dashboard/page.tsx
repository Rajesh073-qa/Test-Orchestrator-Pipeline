'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Folder, Beaker, Activity, Plus, ChevronRight, Zap, TrendingUp,
  Layout, Database, Code, Clock, CheckCircle2, XCircle, Loader2,
  Sparkles, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import apiClient from '@/lib/api-client';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { label: 'Test Plan Gen', href: '/dashboard/generators/test-plan', icon: Layout, color: 'bg-primary/10 text-primary', desc: 'Generate a comprehensive QA test plan' },
  { label: 'Test Cases Gen', href: '/dashboard/generators/test-cases', icon: Database, color: 'bg-emerald-50 text-emerald-600', desc: 'Create step-by-step test cases' },
  { label: 'Code Gen', href: '/dashboard/generators/code', icon: Code, color: 'bg-violet-50 text-violet-600', desc: 'Generate Playwright or Selenium code' },
  { label: 'Full Workflow', href: '/dashboard/generators/workflow', icon: Zap, color: 'bg-amber-50 text-amber-600', desc: 'Plan + Cases + Code in one shot' },
];

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  COMPLETED: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Completed' },
  FAILED: { icon: XCircle, color: 'text-red-500', label: 'Failed' },
  RUNNING: { icon: Loader2, color: 'text-blue-500', label: 'Running' },
  PENDING: { icon: Clock, color: 'text-slate-400', label: 'Pending' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ projects: 0, testCases: 0, jobs: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, testCasesRes, jobsRes] = await Promise.all([
          apiClient.get('/projects').catch(() => ({ data: [] })),
          apiClient.get('/test-case').catch(() => ({ data: [] })),
          apiClient.get('/jobs').catch(() => ({ data: [] })),
        ]);
        setStats({
          projects: projectsRes.data?.length ?? 0,
          testCases: testCasesRes.data?.length ?? 0,
          jobs: jobsRes.data?.length ?? 0,
        });
        setRecentProjects(projectsRes.data?.slice(0, 4) ?? []);
        setRecentJobs(jobsRes.data?.slice(0, 4) ?? []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // Get name from stored token (jwtDecode fallback)
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]!));
        setUserName(payload.email?.split('@')[0] || 'User');
      }
    } catch {}
  }, []);

  const STATS = [
    { label: 'Projects', value: stats.projects, icon: Folder, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/projects' },
    { label: 'Test Cases', value: stats.testCases, icon: Beaker, color: 'text-violet-600', bg: 'bg-violet-50', href: '/dashboard/test-cases' },
    { label: 'Jobs Run', value: stats.jobs, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/dashboard/jobs' },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-8 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/70 text-sm font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4" /> Welcome back{userName ? `, ${userName}` : ''}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">QA Orchestration Dashboard</h1>
          <p className="text-white/70 text-sm max-w-xl">
            AI-powered test generation at your fingertips. Generate plans, cases, and automation code in seconds.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/dashboard/generators/workflow">
              <Button className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg">
                <Zap className="w-4 h-4 mr-2" /> Generate Full Workflow
              </Button>
            </Link>
            <Link href="/dashboard/projects">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-12 w-64 h-64 rounded-full bg-white/5" />
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        {STATS.map((s, i) => (
          <Link key={i} href={s.href}>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <h3 className="text-4xl font-extrabold text-slate-900 mt-1">
                    {loading ? <span className="inline-block w-10 h-9 bg-slate-100 rounded animate-pulse" /> : s.value}
                  </h3>
                </div>
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner', s.bg)}>
                  <s.icon className={cn('w-7 h-7', s.color)} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">⚡ Quick Generators</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((a, i) => (
            <Link key={i} href={a.href}>
              <Card className="border hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', a.color)}>
                    <a.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{a.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors mt-auto self-end" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects + Recent Jobs */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
            <Link href="/dashboard/projects" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)
            ) : recentProjects.length === 0 ? (
              <Card className="border-dashed border-2 bg-slate-50/80">
                <CardContent className="p-8 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <Folder className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">No projects yet</p>
                    <p className="text-sm text-slate-500">Create your first project to track test suites.</p>
                  </div>
                  <Link href="/dashboard/projects">
                    <Button size="sm" variant="outline">Create First Project</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              recentProjects.map((p: any) => (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                  <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Folder className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.description || 'No description'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Recent Jobs</h2>
            <Link href="/dashboard/jobs" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)
            ) : recentJobs.length === 0 ? (
              <Card className="border-dashed border-2 bg-slate-50/80">
                <CardContent className="p-8 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">No jobs yet</p>
                    <p className="text-sm text-slate-500">Background AI generation tasks appear here.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              recentJobs.map((j: any) => {
                const sc = STATUS_CONFIG[j.status] ?? STATUS_CONFIG['PENDING']!;
                const StatusIcon = sc.icon;
                return (
                  <Card key={j.id} className="border">
                    <CardContent className="p-4 flex items-center gap-4">
                      <StatusIcon className={cn('w-5 h-5 flex-shrink-0', sc.color, j.status === 'RUNNING' && 'animate-spin')} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm capitalize">{j.type?.replace(/_/g, ' ').toLowerCase()}</p>
                        <p className="text-xs text-slate-400 font-mono">#{j.id.slice(0, 8)}</p>
                      </div>
                      <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full', sc.color, 'bg-slate-50 border border-current/20')}>
                        {sc.label}
                      </span>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
