'use client';

import { useState } from 'react';
import { Bot, FileDown, Copy, CheckCircle2, Layout, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiApi } from "@/services/ai-code-api";
import { JiraContextInput } from "@/components/jira-context-input";
import dynamic from 'next/dynamic';

const TestPlanGeneratorPage = dynamic(() => Promise.resolve(function TestPlanGeneratorPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const data = await aiApi.quickGenerateTestPlan(input);
      setResult(data);
    } catch (err) {
      alert("Failed to generate test plan. Try again.");
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

  const downloadPDF = async () => {
    if (!result) return;
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    await import('jspdf-autotable');

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Test Plan: ${result.title || 'Generated Plan'}`, 14, 22);
    
    doc.setFontSize(12);
    const splitDesc = doc.splitTextToSize(result.description || '', 180);
    doc.text(splitDesc, 14, 32);

    let y = 32 + (splitDesc.length * 6) + 10;
    
    // Test Scenarios table
    const tableData = result.testScenarios?.map((s: any) => [s.scenario, s.description]) || [];
    if (tableData.length > 0) {
      (doc as any).autoTable({
        startY: y,
        head: [['Scenario', 'Description']],
        body: tableData,
      });
    }

    doc.save('TestPlan.pdf');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Layout className="w-8 h-8 text-primary" /> Test Plan Generator
        </h1>
        <p className="text-slate-500 mt-2">Generate a comprehensive QA Test Plan from requirements or Jira integration.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl">
          <CardContent className="p-6 space-y-6">
            <JiraContextInput value={input} onChange={setInput} />
            <Button className="w-full font-bold shadow-lg shadow-primary/20" onClick={generate} disabled={loading || !input}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
              Generate Test Plan
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
                <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white" onClick={downloadPDF} disabled={!result}>
                  <FileDown className="w-4 h-4 mr-2" /> PDF
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 rounded-xl p-4 overflow-auto font-mono text-sm max-h-[600px]">
              {result ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
              ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center opacity-30">
                  <Layout className="w-16 h-16" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}), { ssr: false });

export default TestPlanGeneratorPage;
