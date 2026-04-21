'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Zap, Loader2, CheckCircle2, FileDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiApi } from "@/services/ai-code-api";
import { JiraContextInput } from "@/components/jira-context-input";

const WorkflowGeneratorPage = dynamic(() => Promise.resolve(function WorkflowGeneratorPage() {
  const [input, setInput] = useState('');
  const [framework, setFramework] = useState('playwright');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const [planResult, setPlanResult] = useState<any>(null);
  const [casesResult, setCasesResult] = useState<any>(null);
  const [codeResult, setCodeResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generateAll = async () => {
    if (!input) return;
    setLoading(true);
    setPlanResult(null);
    setCasesResult(null);
    setCodeResult(null);

    try {
      setStatus('Step 1/3 — Generating Test Plan...');
      const plan = await aiApi.quickGenerateTestPlan(input);
      setPlanResult(plan);

      setStatus('Step 2/3 — Generating Test Cases...');
      const cases = await aiApi.quickGenerateTestCases(input);
      setCasesResult(cases);

      setStatus('Step 3/3 — Generating Automation Code...');
      const code = await aiApi.quickGenerateCode(input, framework);
      setCodeResult(code);

      setStatus('');
    } catch (err) {
      alert("Failed during workflow generation. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!planResult) return;
    const allContent = `=== TEST PLAN ===\n${JSON.stringify(planResult, null, 2)}\n\n=== TEST CASES ===\n${JSON.stringify(casesResult, null, 2)}\n\n=== AUTOMATION CODE ===\n// Page Object\n${codeResult?.pageObject || ''}\n\n// Test Suite\n${codeResult?.testFile || ''}`;
    navigator.clipboard.writeText(allContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAll = () => {
    if (!planResult || !casesResult || !codeResult) return;
    const content = `TEST PLAN\n${'='.repeat(50)}\n${JSON.stringify(planResult, null, 2)}\n\nTEST CASES\n${'='.repeat(50)}\n${JSON.stringify(casesResult, null, 2)}\n\nAUTOMATION CODE\n${'='.repeat(50)}\n// Page Object\n${codeResult.pageObject}\n\n// Test Suite\n${codeResult.testFile}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Full_QA_Workflow.txt');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const isDone = !loading && planResult && casesResult && codeResult;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Zap className="w-8 h-8 text-amber-500" /> Full QA Workflow Generator
        </h1>
        <p className="text-slate-500 mt-2">Generate a complete Test Plan, Test Cases, and Automation Code in one shot from a single requirement or Jira issue.</p>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start">
        {/* LEFT — Input Panel */}
        <div className="space-y-4 sticky top-24">
          <Card className="border-none shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Automation Framework</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                >
                  <option value="playwright">Playwright (TypeScript)</option>
                  <option value="selenium">Selenium (Java)</option>
                </select>
              </div>

              <JiraContextInput value={input} onChange={setInput} />

              <Button
                className="w-full font-bold shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={generateAll}
                disabled={loading || !input}
              >
                {loading ? (
                  <><Loader2 className="animate-spin mr-2 w-4 h-4" />{status}</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" />Generate Entire QA Workflow</>
                )}
              </Button>

              {/* Progress Steps */}
              <div className="space-y-2 pt-2">
                {[
                  { label: 'Test Plan', done: !!planResult },
                  { label: 'Test Cases', done: !!casesResult },
                  { label: 'Automation Code', done: !!codeResult },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {step.done ? '✓' : i + 1}
                    </div>
                    <span className={step.done ? 'text-slate-800 font-semibold' : 'text-slate-400'}>{step.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Output Panel */}
        <Card className="border-none shadow-xl bg-slate-900 text-slate-300">
          <CardContent className="p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-lg">Consolidated Output</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="h-8" onClick={handleCopy} disabled={!planResult}>
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy All
                </Button>
                <Button size="sm" className="h-8 bg-amber-500 hover:bg-amber-600 text-white" onClick={downloadAll} disabled={!isDone}>
                  <FileDown className="w-4 h-4 mr-2" /> Export Bundle
                </Button>
              </div>
            </div>

            <div className="space-y-6 overflow-auto max-h-[700px] pr-2">
              {!planResult && !loading && (
                <div className="h-64 flex flex-col items-center justify-center opacity-30 gap-4">
                  <Zap className="w-16 h-16" />
                  <p className="text-sm">Run the generator to see your full QA workflow here.</p>
                </div>
              )}

              {planResult && (
                <div className="bg-slate-950 rounded-xl p-5">
                  <h4 className="font-bold text-primary mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-black">1</span>
                    Test Plan
                  </h4>
                  <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(planResult, null, 2)}</pre>
                </div>
              )}

              {casesResult && (
                <div className="bg-slate-950 rounded-xl p-5">
                  <h4 className="font-bold text-emerald-400 mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-black">2</span>
                    Test Cases
                  </h4>
                  <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(casesResult, null, 2)}</pre>
                </div>
              )}

              {codeResult && (
                <div className="bg-slate-950 rounded-xl p-5">
                  <h4 className="font-bold text-violet-400 mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-black">3</span>
                    Automation Code
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-slate-500 mb-1 text-xs font-bold uppercase tracking-widest">Page Object</div>
                      <pre className="font-mono text-xs text-blue-300 whitespace-pre-wrap">{codeResult.pageObject}</pre>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1 text-xs font-bold uppercase tracking-widest">Test Suite</div>
                      <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap">{codeResult.testFile}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}), { ssr: false });

export default WorkflowGeneratorPage;
