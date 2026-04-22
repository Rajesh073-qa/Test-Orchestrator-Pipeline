'use client';

import { useQuery } from "@tanstack/react-query";
import { jobApi, Job } from "@/services/job-api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2, FileDown, Copy, CheckCircle2, Layout, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function MyTestPlansPage() {
  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobApi.getMyJobs,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // Filter only COMPLETED TEST_PLAN jobs
  const plans = jobs?.filter(j => j.status === 'COMPLETED' && j.type === 'TEST_PLAN' && j.result) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Layout className="w-8 h-8 text-blue-500" /> My Test Plans
        </h1>
        <p className="text-slate-500 font-medium mt-1">Review, manage, and download all your AI-generated test strategies.</p>
      </div>

      {plans.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center rounded-3xl">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
              <Layout className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No test plans found</h3>
            <p className="text-slate-500 mt-1 mb-6">Use the Test Plan Generator to create your first comprehensive test strategy.</p>
            <a href="/dashboard/generators/test-plan">
              <Button className="font-bold rounded-xl shadow-lg shadow-primary/20">Generate Test Plan</Button>
            </a>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {plans.map((job) => (
            <TestPlanCard key={job.id} job={job} refetch={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}

function TestPlanCard({ job, refetch }: { job: Job, refetch: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  let data: any = null;
  try {
    data = JSON.parse(job.result || '{}');
  } catch {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMD = () => {
    const content = `# ${data.title || 'Test Plan'}\n\n## Objective\n${data.objective || 'N/A'}\n\n## Strategy\n${data.strategy || 'N/A'}\n\n## Scope\n${data.scope || 'N/A'}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'TestPlan.md';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this test plan?')) return;
    setIsDeleting(true);
    try {
      await jobApi.deleteJob(job.id);
      refetch();
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border shadow-sm overflow-hidden bg-white transition-all hover:shadow-md">
      <CardHeader className="p-4 sm:p-6 border-b flex flex-row items-start justify-between bg-slate-50/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-500">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Test Plan</span>
              <span className="text-xs text-slate-400 font-medium">{new Date(job.createdAt).toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{data.title || 'Untitled Test Plan'}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-9 gap-2 text-xs font-bold" onClick={handleDownloadMD}>
            <FileDown className="w-4 h-4" /> Download Markdown
          </Button>
          <Button size="sm" variant="outline" className="h-9 gap-2 text-xs font-bold" onClick={handleCopy}>
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} Copy
          </Button>
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-500" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-0 border-t bg-slate-950">
          <pre className="p-6 font-mono text-[11px] text-blue-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}
