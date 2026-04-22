'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Database, FileDown, Copy, CheckCircle2, Loader2, Bot, AlertCircle, Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiApi } from "@/services/ai-code-api";
import { JiraContextInput } from "@/components/jira-context-input";
import { useSubscription } from "@/hooks/useSubscription";
import ProGate from "@/components/ProGate";

interface TestCaseStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
}

interface TestCase {
  title: string;
  description: string;
  type: 'Positive' | 'Negative' | 'Edge';
  priority: 'High' | 'Medium' | 'Low';
  steps: TestCaseStep[];
}

const priorityColor: Record<string, string> = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const typeColor: Record<string, string> = {
  Positive: 'bg-blue-100 text-blue-700 border-blue-200',
  Negative: 'bg-orange-100 text-orange-700 border-orange-200',
  Edge: 'bg-violet-100 text-violet-700 border-violet-200',
};

const TestCasesGeneratorPage = dynamic(() => Promise.resolve(function TestCasesGeneratorPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[] | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { status, loading: subLoading, refresh: refreshSub } = useSubscription();

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setTestCases(null);
    try {
      const res = await aiApi.quickGenerateTestCases(input);
      console.log('API RESPONSE (Test Cases):', res);
      setTestCases(Array.isArray(res) ? res : []);
      refreshSub();
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 403) {
        refreshSub();
        return;
      }
      setError(err?.response?.data?.message || 'Failed to generate test cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!testCases) return;
    navigator.clipboard.writeText(JSON.stringify(testCases, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadExcel = async () => {
    if (!testCases || testCases.length === 0) return;
    const XLSX = await import('xlsx');
    const rows = testCases.flatMap(tc =>
      tc.steps.map(step => ({
        'Test Case': tc.title,
        'Description': tc.description,
        'Type': tc.type,
        'Priority': tc.priority,
        'Step #': step.stepNumber,
        'Action': step.action,
        'Expected Result': step.expectedResult,
      }))
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');
    XLSX.writeFile(wb, 'TestCases.xlsx');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProGate status={status} loading={subLoading} showTrialBadge>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Database className="w-6 h-6 text-emerald-600" />
          </div>
          Test Cases Generator
        </h1>
        <p className="text-slate-500 mt-2">Generate detailed, step-by-step test cases from requirements or a Jira issue.</p>
      </div>

      {/* Input */}
      <Card className="border-none shadow-xl">
        <CardContent className="p-6 space-y-4">
          <JiraContextInput value={input} onChange={setInput} />
          <Button
            className="w-full font-bold h-11 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <><Loader2 className="animate-spin mr-2 w-4 h-4" />Generating Test Cases...</>
            ) : (
              <><Bot className="w-4 h-4 mr-2" />Generate Test Cases</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Output */}
      {testCases && testCases.length > 0 && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">
              {testCases.length} test case{testCases.length !== 1 ? 's' : ''} generated
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy JSON
              </Button>
              <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={downloadExcel}>
                <FileDown className="w-4 h-4 mr-2" /> Download Excel
              </Button>
            </div>
          </div>

          {/* Test Case Cards */}
          {testCases.map((tc, idx) => (
            <Card key={idx} className="border shadow-md overflow-hidden">
              {/* Card Header */}
              <div className="bg-slate-50 border-b px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-black text-slate-400 bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 truncate">{tc.title}</h3>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${priorityColor[tc.priority]}`}>
                    {tc.priority}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${typeColor[tc.type]}`}>
                    {tc.type}
                  </span>
                </div>
              </div>

              <CardContent className="p-0">
                {tc.description && (
                  <p className="text-sm text-slate-600 px-6 py-3 border-b bg-white">{tc.description}</p>
                )}

                {/* Steps Table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300">
                      <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-widest w-10">#</th>
                      <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-widest w-1/2">Action</th>
                      <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-widest">Expected Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tc.steps.map((step, si) => (
                      <tr key={si} className={si % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-4 py-2.5 text-slate-400 font-mono text-xs font-bold">{step.stepNumber}</td>
                        <td className="px-4 py-2.5 text-slate-700">{step.action}</td>
                        <td className="px-4 py-2.5 text-slate-600 italic">{step.expectedResult}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </ProGate>
    </div>
  );
}), { ssr: false });

export default TestCasesGeneratorPage;
