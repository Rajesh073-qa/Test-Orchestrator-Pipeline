'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testCaseApi } from "../services/test-case-api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Zap, Code, FileText, ChevronLeft, Save, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
}

export default function TestCaseDetail({ id }: Props) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'code'>('details');
  const [codeFile, setCodeFile] = useState<'test' | 'page'>('test');
  const [error, setError] = useState<string | null>(null);

  const { data: tc, isLoading } = useQuery({
    queryKey: ['test-case', id],
    queryFn: () => testCaseApi.getTestCase(id),
  });

  const generateMutation = useMutation({
    mutationFn: (force: boolean = false) => testCaseApi.generateCode(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-case', id] });
      setActiveTab('code');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'AI failed to generate code. Please try again.');
    }
  });

  const downloadMutation = useMutation({
    mutationFn: () => testCaseApi.downloadExport(id, tc?.title.toLowerCase().replace(/\s+/g, '_') || 'test_case'),
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to download ZIP file.');
    }
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tc) return <div>Test case not found.</div>;

  const latestScript = tc.automationScripts?.[0];
  const parsedCode = latestScript ? JSON.parse(latestScript.code) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/dashboard/test-cases"><ChevronLeft className="w-5 h-5" /></a>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tc.title}</h1>
            <p className="text-sm text-muted-foreground">ID: {tc.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {latestScript && (
            <Button 
              variant="outline" 
              onClick={() => downloadMutation.mutate()}
              disabled={downloadMutation.isPending}
            >
              {downloadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              Download ZIP
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => generateMutation.mutate(!!latestScript)}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            {latestScript ? 'Regenerate' : 'Generate Automation'}
          </Button>

          <Button>
             <Save className="w-4 h-4 mr-2" />
             Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 px-2" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      <div className="flex gap-1 border-b">
        <button 
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px]",
            activeTab === 'details' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('details')}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Test Details
        </button>
        <button 
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px]",
            activeTab === 'code' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            !latestScript && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => latestScript && setActiveTab('code')}
        >
          <Code className="w-4 h-4 inline mr-2" />
          Automation Code
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Steps */}
        <div className={cn("lg:col-span-2 space-y-6", activeTab === 'code' && "hidden lg:block")}>
           <Card>
              <CardHeader>
                 <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-muted-foreground">{tc.description}</p>
              </CardContent>
           </Card>

           <Card>
              <CardHeader>
                 <CardTitle className="text-lg">Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {tc.steps.map((step) => (
                    <div key={step.id} className="flex gap-4 p-3 rounded-lg bg-muted/50 border border-muted">
                       <div className="font-bold text-primary">{step.stepNumber}</div>
                       <div className="flex-1">
                          <div className="font-medium">{step.action}</div>
                          <div className="text-sm text-muted-foreground mt-1 italic">
                             Expected: {step.expectedResult}
                          </div>
                       </div>
                    </div>
                 ))}
              </CardContent>
           </Card>
        </div>

        {/* Right Column / Code Panel */}
        <div className={cn("lg:col-span-1", activeTab === 'details' && "hidden lg:block")}>
           <Card className="h-full min-h-[500px] flex flex-col bg-slate-950 text-slate-50 border-slate-800">
              <CardHeader className="border-b border-slate-800 py-3 flex flex-row items-center justify-between space-y-0">
                 <div className="flex gap-2">
                    <button 
                      className={cn("text-xs px-2 py-1 rounded transition-colors", codeFile === 'test' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300")}
                      onClick={() => setCodeFile('test')}
                    >
                      {tc.title.toLowerCase().replace(/\s+/g, '_')}.spec.ts
                    </button>
                    <button 
                      className={cn("text-xs px-2 py-1 rounded transition-colors", codeFile === 'page' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300")}
                      onClick={() => setCodeFile('page')}
                    >
                      {tc.title.toLowerCase().replace(/\s+/g, '_')}.page.ts
                    </button>
                 </div>
                 <div className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">
                    Playwright
                 </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-auto font-mono text-sm leading-relaxed">
                 {!latestScript ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 p-8 text-center">
                       <Code className="w-12 h-12 mb-4 opacity-20" />
                       <p>No code generated yet.</p>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="mt-4 border-slate-800 text-slate-400 hover:bg-slate-900"
                         onClick={() => generateMutation.mutate(false)}
                       >
                         Generate Now
                       </Button>
                    </div>
                 ) : (
                    <pre className="p-4 whitespace-pre-wrap">
                       {codeFile === 'test' ? parsedCode.testFile : parsedCode.pageObject}
                    </pre>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
