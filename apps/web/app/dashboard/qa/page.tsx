'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import {
  FolderKanban, Activity, Sparkles, Plus, ArrowUpRight,
  Code, Layout, Database, Zap, ShieldCheck, Cpu, Cloud, Link2, 
  Rocket, Layers, PlayCircle, Clock, Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { useSearchParams, useRouter } from 'next/navigation';

const COMMANDS = [
  { label: 'New AI Workflow', href: '/dashboard/generators/workflow', icon: Zap, bg: 'from-amber-400 to-orange-500', text: 'Generate End-to-End', delay: '0' },
  { label: 'Create Project', href: '/dashboard/projects', icon: Plus, bg: 'from-blue-500 to-indigo-600', text: 'Setup New Workspace', delay: '100' },
  { label: 'Asset Library', href: '/dashboard/jobs', icon: Layers, bg: 'from-emerald-400 to-teal-500', text: 'View Generated Tests', delay: '200' },
  { label: 'System Config', href: '/dashboard/settings', icon: Cpu, bg: 'from-violet-500 to-purple-600', text: 'Manage AI Models', delay: '300' },
];

const MODULES = [
  { label: 'Test Plan Matrix', href: '/dashboard/generators/test-plan', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-50', hover: 'hover:border-blue-500 hover:shadow-blue-500/20' },
  { label: 'Test Cases Suite', href: '/dashboard/generators/test-cases', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50', hover: 'hover:border-emerald-500 hover:shadow-emerald-500/20' },
  { label: 'Automation Code', href: '/dashboard/generators/code', icon: Code, color: 'text-violet-500', bg: 'bg-violet-50', hover: 'hover:border-violet-500 hover:shadow-violet-500/20' },
];

export default function QADashboard() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
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

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast({ type: 'success', title: 'Upgrade Complete', message: 'You now have unlimited access to all AI features!' });
      router.replace('/dashboard/qa');
    }
  }, [searchParams, router, toast]);

  const recentAssets = jobs.filter(j => j.status === 'COMPLETED').slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-7xl mx-auto">
      
      {/* Top HUD Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg">
            <Rocket className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 leading-none">Test Orchestrator Hub</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Command Center</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Cloud className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 leading-none">AI Engine</span>
              <span className="text-xs font-bold text-slate-700">Online & Ready</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 leading-none">Access Level</span>
              <span className="text-xs font-bold text-slate-700">{user?.role === 'ADMIN' ? 'Unlimited' : 'QA Pro'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Quick Commands & Projects */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Action Command Center */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Quick Commands</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {COMMANDS.map((cmd) => (
                <Link key={cmd.label} href={cmd.href}>
                  <div className={`group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${cmd.bg} text-white shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer border-t border-l border-white/20`} style={{ animationDelay: `${cmd.delay}ms` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-black mb-1">{cmd.label}</h4>
                        <p className="text-white/80 text-sm font-medium">{cmd.text}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <cmd.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Active Projects Viewer */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <FolderKanban className="w-6 h-6 text-blue-600" /> Active Workspaces
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Manage your testing projects and user stories.</p>
                </div>
                <Link href="/dashboard/projects">
                  <Button variant="outline" className="font-bold border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                    View All Workspaces <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              {loading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />)}
                </div>
              ) : projects.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-3xl p-10 text-center">
                  <Folder className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold mb-4">No workspaces initialized</p>
                  <Link href="/dashboard/projects">
                    <Button className="font-bold rounded-xl shadow-lg"><Plus className="w-4 h-4 mr-2" /> Initialize Workspace</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {projects.slice(0, 4).map(p => (
                    <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                      <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer hover:border-blue-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Folder className="w-6 h-6 text-slate-400 group-hover:text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate text-base">{p.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{p._count?.userStories || 0} Stories</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Updated
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Modules & History */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Standalone Modules */}
          <section className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 to-transparent rounded-full blur-3xl -translate-y-10 translate-x-10" />
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Individual Modules
              </h3>
              <div className="space-y-3">
                {MODULES.map((mod) => (
                  <Link key={mod.label} href={mod.href}>
                    <div className={`group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${mod.bg} ${mod.color} flex items-center justify-center`}>
                          <mod.icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-white/90 group-hover:text-white">{mod.label}</span>
                      </div>
                      <PlayCircle className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Asset History Stream */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" /> Asset Stream
              </h3>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
                  </div>
                ))
              ) : recentAssets.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl text-sm font-medium text-slate-500">
                  No assets generated yet.
                </div>
              ) : (
                recentAssets.map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {asset.type === 'TEST_PLAN' ? <Layout className="w-5 h-5 text-blue-500" /> : 
                         asset.type === 'TEST_CASES' ? <Database className="w-5 h-5 text-emerald-500" /> : 
                         <Code className="w-5 h-5 text-violet-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 capitalize truncate w-32">{asset.type.replace('_', ' ').toLowerCase()}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{new Date(asset.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <Link2 className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                ))
              )}
            </div>
            <Link href="/dashboard/jobs">
              <Button variant="ghost" className="w-full mt-4 font-black text-xs text-slate-400 hover:text-slate-900 uppercase tracking-widest bg-slate-50 hover:bg-slate-100 rounded-xl h-10">
                Open Full Library
              </Button>
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
