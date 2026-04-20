'use client';

import { useQuery } from "@tanstack/react-query";
import { jobApi, Job } from "@/services/job-api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function JobsPage() {
  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobApi.getMyJobs,
    refetchInterval: 3000, // Poll every 3 seconds for live updates
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Background Jobs</h1>
        <p className="text-muted-foreground">Monitor AI generation and project exports</p>
      </div>

      <div className="grid gap-4">
        {jobs?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p>No jobs found.</p>
            </CardContent>
          </Card>
        ) : (
          jobs?.map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        )}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const percentage = job.total > 0 ? Math.round((job.progress / job.total) * 100) : 0;

  const statusConfig = {
    PENDING: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/10' },
    RUNNING: { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    COMPLETED: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    FAILED: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  };

  const config = statusConfig[job.status];
  const StatusIcon = config.icon;

  return (
    <Card className="overflow-hidden border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("p-2 rounded-lg", config.bg)}>
              <StatusIcon className={cn("w-5 h-5", config.color, job.status === 'RUNNING' && "animate-pulse")} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{job.type.replace('_', ' ')}</h3>
                <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border", config.color, config.bg, "border-current/10")}>
                  {job.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {job.id}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Created {new Date(job.createdAt).toLocaleTimeString()}</p>
            {job.status === 'RUNNING' && (
              <p className="text-sm font-medium text-blue-600 mt-1">{job.progress} / {job.total} processed</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {(job.status === 'RUNNING' || job.status === 'PENDING') && (
          <div className="h-1.5 w-full bg-slate-100 relative">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
        
        {job.status === 'COMPLETED' && (
          <div className="h-1.5 w-full bg-green-500" />
        )}
        
        {job.status === 'FAILED' && (
          <div className="h-1.5 w-full bg-destructive" />
        )}
      </CardContent>
    </Card>
  );
}
