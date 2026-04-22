'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layout, FileDown, Copy, CheckCircle2, Loader2, Bot, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiApi } from "@/services/ai-code-api";
import { JiraContextInput } from "@/components/jira-context-input";
import { useSubscription } from "@/hooks/useSubscription";
import ProGate from "@/components/ProGate";

interface TestPlan {
  title: string;
  objective: string;
  scope: { inScope: string[]; outOfScope: string[] };
  strategy: string;
  risks: string[];
  environment: string;
  entryCriteria: string;
  exitCriteria: string;
  testSchedule?: string;
  defectManagementProcess?: string;
}

const TestPlanGeneratorPage = dynamic(() => Promise.resolve(function TestPlanGeneratorPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { status, loading: subLoading, refresh: refreshSub } = useSubscription();

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setTestPlan(null);
    try {
      const res = await aiApi.quickGenerateTestPlan(input);
      console.log('API RESPONSE (Test Plan):', res);
      setTestPlan(res);
      refreshSub(); // re-check trial status after successful generation
    } catch (err: any) {
      console.error(err);
      // Handle trial exhausted
      if (err?.response?.status === 403) {
        refreshSub();
        return;
      }
      setError(err?.response?.data?.message || 'Failed to generate test plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!testPlan) return;
    navigator.clipboard.writeText(JSON.stringify(testPlan, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = async () => {
    if (!testPlan) return;
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF();

    let y = 20;
    const lm = 14; // left margin
    const pw = 182; // page width

    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text(testPlan.title, lm, y); y += 10;

    const section = (label: string, text: string) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text(label, lm, y); y += 6;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      const lines = doc.splitTextToSize(text, pw);
      doc.text(lines, lm, y); y += lines.length * 5 + 6;
    };

    const list = (label: string, items: string[]) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text(label, lm, y); y += 6;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      items.forEach(item => {
        if (y > 270) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(`• ${item}`, pw - 4);
        doc.text(lines, lm + 2, y); y += lines.length * 5 + 2;
      });
      y += 4;
    };

    section('Objective', testPlan.objective);
    section('Strategy', testPlan.strategy);
    section('Environment', testPlan.environment);
    section('Entry Criteria', testPlan.entryCriteria);
    section('Exit Criteria', testPlan.exitCriteria);
    list('In Scope', testPlan.scope?.inScope || []);
    list('Out of Scope', testPlan.scope?.outOfScope || []);
    list('Risks', testPlan.risks || []);

    doc.save('TestPlan.pdf');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProGate status={status} loading={subLoading} showTrialBadge>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layout className="w-6 h-6 text-primary" />
          </div>
          Test Plan Generator
        </h1>
        <p className="text-slate-500 mt-2">Generate a comprehensive, structured QA Test Plan from requirements or a Jira issue.</p>
      </div>

      {/* Input */}
      <Card className="border-none shadow-xl">
        <CardContent className="p-6 space-y-4">
          <JiraContextInput value={input} onChange={setInput} />
          <Button
            className="w-full font-bold h-11 shadow-lg shadow-primary/20"
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <><Loader2 className="animate-spin mr-2 w-4 h-4" />Generating Test Plan...</>
            ) : (
              <><Bot className="w-4 h-4 mr-2" />Generate Test Plan</>
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

      {/* Output — Structured Render */}
      {testPlan && (
        <Card className="border-none shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-primary px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-white font-bold text-lg">{testPlan.title}</h2>
              <p className="text-primary-foreground/70 text-xs mt-0.5 uppercase tracking-widest font-bold">Test Plan</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="h-8" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy JSON
              </Button>
              <Button size="sm" className="h-8 bg-white text-primary hover:bg-white/90" onClick={downloadPDF}>
                <FileDown className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Objective */}
            <Section title="Objective" content={testPlan.objective} />
            <Section title="Test Strategy" content={testPlan.strategy} />
            <Section title="Environment" content={testPlan.environment} />

            {/* Scope */}
            <div className="grid sm:grid-cols-2 gap-6">
              <ListSection title="✅ In Scope" items={testPlan.scope?.inScope} color="emerald" />
              <ListSection title="❌ Out of Scope" items={testPlan.scope?.outOfScope} color="slate" />
            </div>

            {/* Criteria */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Section title="Entry Criteria" content={testPlan.entryCriteria} />
              <Section title="Exit Criteria" content={testPlan.exitCriteria} />
            </div>

            {/* Advanced Enterprise Sections */}
            <div className="grid sm:grid-cols-2 gap-6">
              {testPlan.testSchedule && <Section title="Test Schedule" content={testPlan.testSchedule} />}
              {testPlan.defectManagementProcess && <Section title="Defect Management" content={testPlan.defectManagementProcess} />}
            </div>

            {/* Risks */}
            <ListSection title="⚠️ Risks" items={testPlan.risks} color="amber" />
          </CardContent>
        </Card>
      )}
      </ProGate>
    </div>
  );
}), { ssr: false });

export default TestPlanGeneratorPage;

// ─── Reusable sub-components ────────────────────────────────────────────────

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">{title}</h3>
      <p className="text-slate-800 text-sm leading-relaxed">{content}</p>
    </div>
  );
}

function ListSection({ title, items, color }: { title: string; items: string[]; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
  };
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {(items || []).map((item, i) => (
          <li key={i} className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg border ${colorMap[color] || colorMap.slate}`}>
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
