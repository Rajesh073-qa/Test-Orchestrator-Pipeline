'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { 
  BarChart3, 
  Plus, 
  ChevronRight, 
  Clock, 
  Activity, 
  FolderKanban, 
  CheckSquare, 
  Cpu, 
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Folder,
  Beaker,
  Layout,
  Database,
  Code,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { cn } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  const [projects, setProjects] = useState<any[]>([]);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, testCasesRes, jobsRes] = await Promise.all([
          api.get('/projects').catch(() => ({ data: [] })),
          api.get('/test-case').catch(() => ({ data: [] })),
          api.get('/jobs').catch(() => ({ data: [] })),
        ]);
        setProjects(projectsRes.data ?? []);
        setTestCases(testCasesRes.data ?? []);
        setJobs(jobsRes.data ?? []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]!));
        setUserName(payload.email?.split('@')[0] || 'User');
      }
    } catch {}
  }, []);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'AI Generations',
        data: [12, 19, 15, 25, 22, 30, 45],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { borderDash: [5, 5] }, beginAtZero: true },
    },
  };

  const stats = [
    { label: 'Active Projects', value: projects.length, icon: Folder, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Test Cases', value: testCases.length, icon: Beaker, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'AI Jobs', value: jobs.length, icon: Cpu, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Security', value: 'Secure', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-[0.2em] mb-1">
            <Sparkles className="w-4 h-4" /> Enterprise Dashboard
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back{userName ? `, ${userName}` : ''}! Here's your automation roadmap.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold border-slate-200">
            <Activity className="w-4 h-4 mr-2" /> Global Activity
          </Button>
          <Link href="/dashboard/projects">
            <Button className="font-bold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12%
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {loading ? <span className="inline-block w-12 h-8 bg-slate-100 rounded animate-pulse" /> : stat.value}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Main Chart Area */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Automation Velocity</CardTitle>
                <p className="text-xs text-slate-400">Track your AI test generation throughput</p>
              </div>
              <select className="text-xs font-bold bg-slate-50 border border-slate-100 rounded-md px-2 py-1 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <Line data={chartData} options={chartOptions as any} />
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
              <Link href="/dashboard/projects" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}
              </div>
            ) : projects.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-200 bg-transparent py-12 text-center">
                <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No projects found.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                    <Card className="border shadow-sm hover:shadow-md transition-all group cursor-pointer overflow-hidden">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Folder className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {p._count?.userStories || 0} User Stories
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Quick Generators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {QUICK_ACTIONS.map((a, i) => (
                <Link key={i} href={a.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors group">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors", a.color)}>
                    <a.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold group-hover:text-primary transition-colors">{a.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{a.desc}</div>
                  </div>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-slate-800 mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-4">
                  <span>SYSTEM STATUS</span>
                  <span className="text-emerald-400">● ONLINE</span>
                </div>
                <div className="space-y-3">
                  <StatusRow label="Jira Bridge" status="Active" />
                  <StatusRow label="AI Models" status="Operational" />
                  <StatusRow label="Cloud Storage" status="Operational" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs Panel */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />)
              ) : jobs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No recent activity.</p>
              ) : (
                jobs.slice(0, 5).map((j: any) => {
                  const sc = STATUS_CONFIG[j.status] ?? STATUS_CONFIG['PENDING']!;
                  return (
                    <div key={j.id} className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", sc.color.replace('text', 'bg'))} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate capitalize">{j.type?.replace(/_/g, ' ').toLowerCase()}</p>
                        <p className="text-[10px] text-slate-400">{new Date(j.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", sc.color, "bg-slate-50")}>
                        {j.status}
                      </span>
                    </div>
                  );
                })
              )}
              <Link href="/dashboard/jobs" className="block pt-2 text-center text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                View All Activity
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200 font-bold">{status}</span>
    </div>
  );
}
