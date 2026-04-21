'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Database, FileDown, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiApi } from "@/services/ai-code-api";
import { JiraContextInput } from "@/components/jira-context-input";

const TestCasesGeneratorPage = dynamic(() => Promise.resolve(function TestCasesGeneratorPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const data = await aiApi.quickGenerateTestCases(input);
      setResult(data);
    } catch (err) {
      alert("Failed to generate test cases. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadExcel = async () => {
    if (!result || !Array.isArray(result)) return;
    const XLSX = await import('xlsx');
    const rows = result.flatMap((tc: any) =>
      (tc.steps || []).map((step: any) => ({
        TestCaseID: tc.title,
        Description: tc.description,
        Priority: tc.priority,
        Type: tc.type,
        StepNumber: step.stepNumber,
        Action: step.action,
        ExpectedResult: step.expectedResult,
      }))
    );
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Cases");
    XLSX.writeFile(workbook, "TestCases.xlsx");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-8 h-8 text-emerald-600" /> Test Cases Generator
        </h1>
        <p className="text-slate-500 mt-2">Generate detailed, step-by-step test cases from your requirements or Jira issues.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl">
          <CardContent className="p-6 space-y-6">
            <JiraContextInput value={input} onChange={setInput} />
            <Button className="w-full font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700" onClick={generate} disabled={loading || !input}>
              {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Database className="w-4 h-4 mr-2" />}
              Generate Test Cases
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-slate-900 text-slate-300">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white">Output</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="h-8" onClick={handleCopy} disabled={!result}>
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />} Copy
                </Button>
                <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={downloadExcel} disabled={!result}>
                  <FileDown className="w-4 h-4 mr-2" /> Excel
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 rounded-xl p-4 overflow-auto font-mono text-sm max-h-[600px]">
              {result ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
              ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center opacity-30">
                  <Database className="w-16 h-16" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}), { ssr: false });

export default TestCasesGeneratorPage;
