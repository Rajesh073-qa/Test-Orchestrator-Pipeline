'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Zap, Loader2, CheckCircle2, FileDown, Copy, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiApi } from "@/services/ai-code-api";
import { JiraContextInput } from "@/components/jira-context-input";

interface TestPlan {
  title: string;
  objective: string;
  scope: { inScope: string[]; outOfScope: string[] };
  strategy: string;
  risks: string[];
  environment: string;
  entryCriteria: string;
  exitCriteria: string;
}

interface TestCase {
  title: string;
  description: string;
  type: string;
  priority: string;
  steps: { stepNumber: number; action: string; expectedResult: string }[];
}

interface CodeResult {
  testFile: string;
  pageObject: string;
}

type Step = 'plan' | 'cases' | 'code';

const STEPS: { key: Step; label: string; emoji: string }[] = [
  { key: 'plan', label: 'Test Plan', emoji: '📋' },
  { key: 'cases', label: 'Test Cases', emoji: '📝' },
  { key: 'code', label: 'Automation Code', emoji: '💻' },
];

const WorkflowGeneratorPage = dynamic(() => Promise.resolve(function WorkflowGeneratorPage() {
  const [input, setInput] = useState('');
  const [framework, setFramework] = useState('playwright');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [error, setError] = useState('');

  const [planResult, setPlanResult] = useState<TestPlan | null>(null);
  const [casesResult, setCasesResult] = useState<TestCase[] | null>(null);
  const [codeResult, setCodeResult] = useState<CodeResult | null>(null);

  const [activeTab, setActiveTab] = useState<Step>('plan');
  const [copied, setCopied] = useState(false);

  const generateAll = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setPlanResult(null);
    setCasesResult(null);
    setCodeResult(null);

    try {
      setCurrentStep('plan');
      const plan = await aiApi.quickGenerateTestPlan(input);
      console.log('API RESPONSE (Plan):', plan);
      setPlanResult(plan);

      setCurrentStep('cases');
      const cases = await aiApi.quickGenerateTestCases(input);
      console.log('API RESPONSE (Cases):', cases);
      setCasesResult(Array.isArray(cases) ? cases : []);

      setCurrentStep('code');
      const code = await aiApi.quickGenerateCode(input, framework);
      console.log('API RESPONSE (Code):', code);
      setCodeResult(code);

      setCurrentStep(null);
      setActiveTab('plan');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
      setCurrentStep(null);
    }
  };

  const isDone = !loading && planResult && casesResult && codeResult;

  const copyAll = () => {
    const text = `=== TEST PLAN ===\n${JSON.stringify(planResult, null, 2)}\n\n=== TEST CASES ===\n${JSON.stringify(casesResult, null, 2)}\n\n=== CODE ===\n// Page Object\n${codeResult?.pageObject}\n\n// Test Suite\n${codeResult?.testFile}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportBundle = () => {
    if (!isDone) return;
    const content = `TEST PLAN\n${'='.repeat(60)}\n${JSON.stringify(planResult, null, 2)}\n\nTEST CASES\n${'='.repeat(60)}\n${JSON.stringify(casesResult, null, 2)}\n\nAUTOMATION CODE\n${'='.repeat(60)}\n// Page Object\n${codeResult!.pageObject}\n\n// Test Suite\n${codeResult!.testFile}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'QA_Workflow_Bundle.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          Full QA Workflow Generator
        </h1>
        <p className="text-slate-500 mt-2">
          Generate a complete Test Plan, Test Cases, and Automation Code in one shot.
        </p>
      </div>

      {/* Input + Progress */}
      <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">
        <div className="space-y-4 sticky top-24">
          <Card className="border-none shadow-xl">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Automation Framework</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  value={framework}
                  onChange={e => setFramework(e.target.value)}
                >
                  <option value="playwright">Playwright (TypeScript)</option>
                  <option value="selenium">Selenium (Java)</option>
                </select>
              </div>

              <JiraContextInput value={input} onChange={setInput} />

              <Button
                className="w-full font-bold h-11 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                onClick={generateAll}
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <><Loader2 className="animate-spin mr-2 w-4 h-4" />
                    {currentStep === 'plan' && 'Generating Test Plan...'}
                    {currentStep === 'cases' && 'Generating Test Cases...'}
                    {currentStep === 'code' && 'Generating Code...'}
                  </>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" />Generate Entire QA Workflow</>
                )}
              </Button>

              {/* Step Progress */}
              <div className="space-y-2 pt-1">
                {STEPS.map((s, i) => {
                  const done = s.key === 'plan' ? !!planResult : s.key === 'cases' ? !!casesResult : !!codeResult;
                  const active = currentStep === s.key;
                  return (
                    <div key={s.key} className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-amber-50 border border-amber-200' : done ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${done ? 'bg-emerald-500 text-white' : active ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span className={`font-semibold ${done ? 'text-emerald-700' : active ? 'text-amber-700' : 'text-slate-400'}`}>
                        {s.emoji} {s.label}
                      </span>
                      {active && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 ml-auto" />}
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output panel */}
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {!planResult && !loading && (
            <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Zap className="w-10 h-10 opacity-20" />
              <p className="text-sm font-medium">Your full QA workflow will appear here.</p>
            </div>
          )}

          {(planResult || casesResult || codeResult) && (
            <Card className="border-none shadow-xl overflow-hidden">
              {/* Tabs */}
              <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                <div className="flex">
                  {STEPS.filter(s =>
                    (s.key === 'plan' && planResult) ||
                    (s.key === 'cases' && casesResult) ||
                    (s.key === 'code' && codeResult)
                  ).map(s => (
                    <button
                      key={s.key}
                      onClick={() => setActiveTab(s.key)}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold mr-1 transition-colors ${activeTab === s.key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={copyAll} disabled={!isDone}>
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    Copy All
                  </Button>
                  <Button size="sm" className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white" onClick={exportBundle} disabled={!isDone}>
                    <FileDown className="w-3.5 h-3.5 mr-1" /> Export Bundle
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 space-y-5 max-h-[700px] overflow-auto">
                {/* Plan Tab */}
                {activeTab === 'plan' && planResult && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-extrabold text-slate-900">{planResult.title}</h2>
                    <FieldRow label="Objective" value={planResult.objective} />
                    <FieldRow label="Strategy" value={planResult.strategy} />
                    <FieldRow label="Environment" value={planResult.environment} />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <ChipList label="✅ In Scope" items={planResult.scope?.inScope} />
                      <ChipList label="❌ Out of Scope" items={planResult.scope?.outOfScope} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FieldRow label="Entry Criteria" value={planResult.entryCriteria} />
                      <FieldRow label="Exit Criteria" value={planResult.exitCriteria} />
                    </div>
                    <ChipList label="⚠️ Risks" items={planResult.risks} />
                  </div>
                )}

                {/* Cases Tab */}
                {activeTab === 'cases' && casesResult && (
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-500">{casesResult.length} test cases generated</p>
                    {casesResult.map((tc, idx) => (
                      <div key={idx} className="border rounded-xl overflow-hidden">
                        <div className="bg-slate-50 border-b px-4 py-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-black text-slate-400 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                            <span className="font-bold text-slate-900 text-sm truncate">{tc.title}</span>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${priorityColor[tc.priority] || ''}`}>{tc.priority}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${typeColor[tc.type] || ''}`}>{tc.type}</span>
                          </div>
                        </div>
                        {tc.description && <p className="text-xs text-slate-500 px-4 py-2 border-b">{tc.description}</p>}
                        <table className="w-full text-xs">
                          <thead><tr className="bg-slate-800 text-slate-300"><th className="text-left px-3 py-1.5 font-bold w-8">#</th><th className="text-left px-3 py-1.5 font-bold w-1/2">Action</th><th className="text-left px-3 py-1.5 font-bold">Expected Result</th></tr></thead>
                          <tbody>
                            {tc.steps.map((step, si) => (
                              <tr key={si} className={si % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="px-3 py-2 text-slate-400 font-mono">{step.stepNumber}</td>
                                <td className="px-3 py-2 text-slate-700">{step.action}</td>
                                <td className="px-3 py-2 text-slate-500 italic">{step.expectedResult}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}

                {/* Code Tab */}
                {activeTab === 'code' && codeResult && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">📄 Page Object</p>
                      <pre className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-blue-300 whitespace-pre-wrap overflow-auto max-h-72">{codeResult.pageObject}</pre>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">🧪 Test Suite</p>
                      <pre className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-emerald-300 whitespace-pre-wrap overflow-auto max-h-72">{codeResult.testFile}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}), { ssr: false });

export default WorkflowGeneratorPage;

// Sub-components
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{label}</h3>
      <p className="text-slate-800 text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function ChipList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{label}</h3>
      <ul className="space-y-1">
        {(items || []).map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-sm text-slate-700">
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
