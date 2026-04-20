'use client';

import { useQuery } from "@tanstack/react-query";
import { testCaseApi, TestCase } from "../services/test-case-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Beaker, ChevronRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TestCaseList() {
  const { data: testCases, isLoading } = useQuery({
    queryKey: ['test-cases'],
    queryFn: () => testCaseApi.getTestCases(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'low': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'reviewed': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Cases</h1>
          <p className="text-muted-foreground">Review and manage your AI-generated test cases.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {testCases?.map((tc) => (
          <Card key={tc.id} className="p-4 hover:border-primary/50 transition-all group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Beaker className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{tc.title}</h3>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border",
                    getPriorityColor(tc.priority)
                  )}>
                    {tc.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{tc.description}</p>
              </div>

              <div className="flex items-center gap-6 pr-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status</span>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(tc.status)}
                    <span className="text-sm font-medium capitalize">{tc.status}</span>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Type</span>
                  <span className="text-sm font-medium">{tc.type}</span>
                </div>

                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform" asChild>
                   <a href={`/dashboard/test-cases/${tc.id}`}>
                      <ChevronRight className="w-5 h-5" />
                   </a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {testCases?.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
           <Beaker className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
           <h3 className="text-xl font-medium text-muted-foreground">No test cases generated yet</h3>
           <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
              Use the AI pipeline to generate test cases from your user stories.
           </p>
        </div>
      )}
    </div>
  );
}
