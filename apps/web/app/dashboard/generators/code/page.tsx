'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Code, FileDown, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiApi } from "@/services/ai-code-api";
import { JiraContextInput } from "@/components/jira-context-input";

const CodeGeneratorPage = dynamic(() => Promise.resolve(function CodeGeneratorPage() {
  const [input, setInput] = useState('');
  const [framework, setFramework] = useState('playwright');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const data = await aiApi.quickGenerateCode(input, framework);
      setResult(data);
    } catch (err) {
      alert("Failed to generate automation code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.pageObject || ''}\n\n${result.testFile || ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    if (!result) return;
    const ext = framework === 'selenium' ? 'java' : 'ts';
    const fileName = `automation-code.${ext}`;
    const content = `// PAGE OBJECT\n${result.pageObject}\n\n// TEST SUITE\n${result.testFile}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Code className="w-8 h-8 text-violet-600" /> Automation Code Generator
        </h1>
        <p className="text-slate-500 mt-2">Generate executable Selenium or Playwright automation code directly from requirements or a Jira issue.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Select Framework</label>
              <select
                className="w-full h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-violet-500 outline-none"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
              >
                <option value="playwright">Playwright (TypeScript)</option>
                <option value="selenium">Selenium (Java)</option>
              </select>
            </div>
            <JiraContextInput value={input} onChange={setInput} />
            <Button className="w-full font-bold shadow-lg shadow-violet-500/20 bg-violet-600 hover:bg-violet-700" onClick={generate} disabled={loading || !input}>
              {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Code className="w-4 h-4 mr-2" />}
              Generate Automation Code
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
                <Button size="sm" className="h-8 bg-violet-600 hover:bg-violet-700 text-white" onClick={downloadCode} disabled={!result}>
                  <FileDown className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 rounded-xl p-4 overflow-auto font-mono text-xs max-h-[600px]">
              {result ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-slate-500 mb-1 font-bold border-b border-slate-800 pb-1 text-xs uppercase tracking-widest">Page Object</div>
                    <pre className="whitespace-pre-wrap text-blue-300">{result.pageObject}</pre>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1 font-bold border-b border-slate-800 pb-1 text-xs uppercase tracking-widest">Test Suite</div>
                    <pre className="whitespace-pre-wrap text-emerald-300">{result.testFile}</pre>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center opacity-30">
                  <Code className="w-16 h-16" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}), { ssr: false });

export default CodeGeneratorPage;
