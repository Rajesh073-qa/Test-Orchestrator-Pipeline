'use client';

import { useQuery } from "@tanstack/react-query";
import { jobApi, Job } from "@/services/job-api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, FileDown, Copy, CheckCircle2, FileText, Code, Database, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AssetLibraryPage() {
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

  // Filter out any non-completed jobs or old non-json jobs if necessary
  const assets = jobs?.filter(j => j.status === 'COMPLETED' && j.result) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Generated Assets</h1>
        <p className="text-slate-500 font-medium mt-1">Your library of AI-powered test plans, test cases, and automation code.</p>
      </div>

      {assets.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center rounded-3xl">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No assets generated yet</h3>
            <p className="text-slate-500 mt-1 mb-6">Use the AI generators to create test plans and scripts.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {assets.map((job) => (
            <AssetCard key={job.id} job={job} refetch={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetCard({ job, refetch }: { job: Job, refetch: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  let data: any = null;
  try {
    data = JSON.parse(job.result || '{}');
  } catch {
    return null; // Skip invalid data
  }

  const isTestPlan = job.type === 'TEST_PLAN';
  const isTestCases = job.type === 'TEST_CASES';
  const isCode = job.type === 'AUTOMATION_CODE';

  // Extract test cases from either a direct array or a nested object
  const testCaseList = isTestCases 
    ? (Array.isArray(data) ? data : (data.testCases || data.cases || [])) 
    : [];

  const Icon = isTestPlan ? FileText : isTestCases ? Database : Code;
  const color = isTestPlan ? 'text-blue-500 bg-blue-50' : isTestCases ? 'text-emerald-500 bg-emerald-50' : 'text-violet-500 bg-violet-50';
  const label = isTestPlan ? 'Test Plan' : isTestCases ? 'Test Cases' : 'Automation Code';
  const title = isTestPlan 
    ? (data.title || 'Untitled Test Plan') 
    : isTestCases 
      ? `Test Cases Set (${testCaseList.length} cases)` 
      : `Code: ${data.framework || 'Playwright'}`;

  const handleCopy = () => {
    let contentToCopy = '';
    if (isCode) {
      contentToCopy = `// ========== PAGE OBJECT ==========\n${data.pageObject || ''}\n\n// ========== TEST SUITE ==========\n${data.testFile || ''}`;
    } else if (isTestCases) {
      contentToCopy = JSON.stringify(testCaseList, null, 2);
    } else {
      contentToCopy = JSON.stringify(data, null, 2);
    }
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const ext = data.framework === 'selenium' ? 'java' : 'ts';
    const content = `// ========== PAGE OBJECT ==========\n${data.pageObject || ''}\n\n// ========== TEST SUITE ==========\n${data.testFile || ''}`;
    downloadFile(content, `automation.${ext}`, 'text/plain');
  };

  const handleDownloadCSV = () => {
    if (!isTestCases) return;
    let csv = 'Title,Type,Priority,Steps\n';
    testCaseList.forEach((c: any) => {
      const steps = c.steps?.map((s: any) => `${s.stepNumber || ''}. ${s.action || s.description || ''} - ${s.expectedResult || ''}`).join(' | ') || '';
      csv += `"${c.title || ''}","${c.type || ''}","${c.priority || ''}","${steps.replace(/"/g, '""')}"\n`;
    });
    downloadFile(csv, 'test-cases.csv', 'text/csv');
  };

  const handleDownloadMD = () => {
    if (!isTestPlan) return;
    
    const content = `# ${data.title || 'Test Plan'}\n\n## Objective\n${data.objective || 'N/A'}\n\n## Strategy\n${data.strategy || 'N/A'}\n\n## Scope\n${data.scope || 'N/A'}`;
    downloadFile(content, 'TestPlan.md', 'text/markdown');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    setIsDeleting(true);
    try {
      await jobApi.deleteJob(job.id);
      refetch();
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border shadow-sm overflow-hidden bg-white transition-all hover:shadow-md">
      <CardHeader className="p-4 sm:p-6 border-b flex flex-row items-start justify-between bg-slate-50/50">
        <div className="flex items-start gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{label}</span>
              <span className="text-xs text-slate-400 font-medium">{new Date(job.createdAt).toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isTestPlan && (
            <Button size="sm" variant="outline" className="h-9 gap-2 text-xs font-bold" onClick={handleDownloadMD}>
              <FileDown className="w-4 h-4" /> Markdown
            </Button>
          )}
          {isTestCases && (
            <Button size="sm" variant="outline" className="h-9 gap-2 text-xs font-bold" onClick={handleDownloadCSV}>
              <FileDown className="w-4 h-4" /> CSV/Excel
            </Button>
          )}
          {isCode && (
            <Button size="sm" variant="outline" className="h-9 gap-2 text-xs font-bold" onClick={handleDownloadCode}>
              <FileDown className="w-4 h-4" /> Code
            </Button>
          )}
          
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
          <pre className="p-6 font-mono text-[11px] text-emerald-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-auto">
            {isCode 
              ? `// ========== PAGE OBJECT ==========\n${data.pageObject}\n\n// ========== TEST SUITE ==========\n${data.testFile}`
              : JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}
