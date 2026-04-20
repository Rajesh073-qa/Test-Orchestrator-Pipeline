'use client';

import { useQuery } from "@tanstack/react-query";
import { jobApi, Job } from "@/services/job-api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthGuard from "@/components/auth-guard";

export default function JobsPage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobApi.getMyJobs,
    refetchInterval: 3000, // Poll every 3 seconds for live updates
  });

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto py-12 px-6 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Background Jobs</h1>
          <p className="text-slate-500 text-lg">Monitor your AI generation tasks and project exports in real-time.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs?.length === 0 ? (
              <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Activity className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-xl font-medium">No active or past jobs found.</p>
                  <p className="text-sm">Start a workflow in the Orchestrator to see jobs here.</p>
                </CardContent>
              </Card>
            ) : (
              jobs?.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

function JobCard({ job }: { job: Job }) {
  const percentage = job.total > 0 ? Math.round((job.progress / job.total) * 100) : 0;

  const statusConfig = {
    PENDING: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-100', accent: 'bg-slate-400' },
    RUNNING: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', accent: 'bg-blue-600' },
    COMPLETED: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'bg-emerald-600' },
    FAILED: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', accent: 'bg-destructive' },
  };

  const config = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  return (
    <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 bg-white">
      <CardContent className="p-0">
        <div className="p-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", config.bg)}>
              <StatusIcon className={cn("w-7 h-7", config.color, job.status === 'RUNNING' && "animate-pulse")} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900 capitalize">{job.type.replace(/_/g, ' ').toLowerCase()}</h3>
                <span className={cn("text-[10px] uppercase font-black px-2 py-1 rounded-full", config.color, config.bg)}>
                  {job.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono mt-1">Ref: {job.id.slice(0, 8)}...</p>
            </div>
          </div>
          
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Started At</p>
            <p className="text-sm font-semibold text-slate-900">{new Date(job.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Progress Logic */}
        <div className="px-8 pb-8">
            <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {job.status === 'RUNNING' ? 'Processing...' : 'Status'}
                </span>
                <span className="text-sm font-bold text-slate-900">{percentage}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000 ease-out rounded-full", config.accent)}
                  style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
