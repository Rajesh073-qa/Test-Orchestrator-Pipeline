'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Folder, 
  Beaker, 
  Activity, 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import apiClient from '@/lib/api-client';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    testCases: 0,
    activeJobs: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, testCasesRes, jobsRes] = await Promise.all([
          apiClient.get('/api/projects'),
          apiClient.get('/api/test-case'),
          apiClient.get('/api/jobs'),
        ]);

        setStats({
          projects: projectsRes.data.length,
          testCases: testCasesRes.data.length,
          activeJobs: jobsRes.data.filter((j: any) => j.status === 'active').length,
        });

        setRecentProjects(projectsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">Welcome to your QA orchestration dashboard.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/projects">
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Create Project
            </Button>
          </Link>
        </div>
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Projects', value: stats.projects, icon: Folder, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Test Cases', value: stats.testCases, icon: Beaker, color: 'text-violet-600', bg: 'bg-violet-100' },
          { label: 'Active Jobs', value: stats.activeJobs, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : stat.value}</h3>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* --- Recent Projects --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
            <Link href="/dashboard/projects" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)
            ) : recentProjects.length === 0 ? (
              <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="p-10 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Folder className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">No projects yet</p>
                    <p className="text-sm text-slate-500">Create your first project to start generating tests.</p>
                  </div>
                  <Link href="/dashboard/projects">
                    <Button variant="outline" size="sm">Create First Project</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              recentProjects.map((project: any) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Folder className="w-6 h-6 text-slate-600 group-hover:text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{project.name}</h4>
                            <p className="text-sm text-slate-500">{project.description || 'No description'}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* --- Activity / Tips --- */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="grid gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start text-left flex flex-col items-start gap-1">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Import from Jira
              </span>
              <span className="text-xs text-slate-500">Sync your stories and requirements</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start text-left flex flex-col items-start gap-1">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Run AI Generator
              </span>
              <span className="text-xs text-slate-500">Create test plan for current project</span>
            </Button>
          </div>

          <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pro Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your Jira project to automatically generate test cases whenever a new user story is added.
              </p>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Workflow className="w-24 h-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
