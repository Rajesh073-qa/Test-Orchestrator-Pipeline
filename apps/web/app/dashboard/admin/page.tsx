'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import {
  Users, Shield, Activity, Cpu, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, Clock, BarChart2, Database, Zap,
  ArrowUpRight, RefreshCw, UserCheck, Ban, MoreVertical,
  CreditCard, Server, Globe, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  totalTestCases: number;
  totalJobs: number;
  activeJobs: number;
  failedJobs: number;
}

interface UserRow {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  _count?: { projects: number; jobs: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: {} })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/jobs').catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data ?? []);
      setJobs(jobsRes.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) { console.error(e); }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700 border-red-200',
    QA: 'bg-blue-100 text-blue-700 border-blue-200',
    USER: 'bg-slate-100 text-slate-600 border-slate-200',
    VIEWER: 'bg-slate-50 text-slate-400 border-slate-100',
  };

  const jobStatusColor: Record<string, string> = {
    COMPLETED: 'text-emerald-500', FAILED: 'text-red-500',
    RUNNING: 'text-blue-500', PENDING: 'text-slate-400',
  };

  const kpis = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'bg-blue-50 text-blue-600', trend: '+8%' },
    { label: 'Total Projects', value: stats?.totalProjects ?? '—', icon: Database, color: 'bg-emerald-50 text-emerald-600', trend: '+15%' },
    { label: 'Test Cases', value: stats?.totalTestCases ?? '—', icon: CheckCircle2, color: 'bg-violet-50 text-violet-600', trend: '+23%' },
    { label: 'AI Jobs Run', value: stats?.totalJobs ?? '—', icon: Cpu, color: 'bg-amber-50 text-amber-600', trend: '+41%' },
    { label: 'Active Jobs', value: stats?.activeJobs ?? 0, icon: Activity, color: 'bg-sky-50 text-sky-600', trend: 'Live' },
    { label: 'Failed Jobs', value: stats?.failedJobs ?? 0, icon: AlertTriangle, color: 'bg-red-50 text-red-600', trend: stats?.failedJobs ? '⚠️' : '✅' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-600 text-xs font-black uppercase tracking-[0.2em] mb-1">
            <Shield className="w-4 h-4" /> Admin Control Center
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium">Full visibility into platform health, users, and jobs.</p>
        </div>
        <Button variant="outline" onClick={fetchData} className="font-bold gap-2 border-slate-200">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', kpi.color)}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {loading ? <span className="inline-block w-10 h-6 bg-slate-100 rounded animate-pulse" /> : kpi.value}
              </h3>
              <span className="text-[10px] font-bold text-emerald-600">{kpi.trend}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* User Management Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" /> User Management
            </h2>
            <Link href="/dashboard/admin/users">
              <Button variant="outline" size="sm" className="font-bold text-xs border-slate-200">
                Manage All <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Projects</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-slate-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : users.slice(0, 8).map(user => (
                    <tr key={user.id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {(user.name || user.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{user.name || '—'}</p>
                            <p className="text-[10px] text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className={cn('text-[10px] font-black px-2 py-1 rounded-full border cursor-pointer outline-none', roleColors[user.role] || roleColors.USER)}
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="QA">QA</option>
                          <option value="USER">USER</option>
                          <option value="VIEWER">VIEWER</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 font-bold">{user._count?.projects ?? 0}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50">
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" /> System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'API Server', status: 'Operational', color: 'text-emerald-400' },
                { label: 'Database', status: 'Healthy', color: 'text-emerald-400' },
                { label: 'AI Engine', status: 'Active', color: 'text-emerald-400' },
                { label: 'Stripe Billing', status: 'Configured', color: 'text-amber-400' },
                { label: 'Google OAuth', status: 'Active', color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{s.label}</span>
                  <span className={cn('font-bold', s.color)}>● {s.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                ))
              ) : jobs.slice(0, 6).map((j: any) => (
                <div key={j.id} className="flex items-center gap-3">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', {
                    'bg-emerald-500': j.status === 'COMPLETED',
                    'bg-red-500': j.status === 'FAILED',
                    'bg-blue-500 animate-pulse': j.status === 'RUNNING',
                    'bg-slate-300': j.status === 'PENDING',
                  })} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate capitalize">{j.type?.replace(/_/g, ' ')?.toLowerCase()}</p>
                    <p className="text-[10px] text-slate-400">{new Date(j.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded uppercase', jobStatusColor[j.status])}>
                    {j.status}
                  </span>
                </div>
              ))}
              <Link href="/dashboard/jobs" className="block text-center text-[10px] font-bold text-primary hover:underline pt-2 uppercase tracking-widest">
                View All Jobs →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
