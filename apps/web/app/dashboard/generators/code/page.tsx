'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Code, FileDown, Copy, CheckCircle2, Loader2, Bot, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiApi } from "@/services/ai-code-api";
import { JiraContextInput } from "@/components/jira-context-input";
import { useSubscription } from "@/hooks/useSubscription";
import ProGate from "@/components/ProGate";

interface CodeResult {
  testFile: string;
  pageObject: string;
}

const CodeGeneratorPage = dynamic(() => Promise.resolve(function CodeGeneratorPage() {
  const [input, setInput] = useState('');
  const [framework, setFramework] = useState('playwright');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pageObject' | 'testFile'>('pageObject');
  const [copied, setCopied] = useState(false);
  const { status, loading: subLoading, refresh: refreshSub } = useSubscription();

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await aiApi.quickGenerateCode(input, framework);
      console.log('API RESPONSE (Code):', res);
      setResult(res);
      setActiveTab('pageObject');
      refreshSub();
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 403) {
        refreshSub();
        return;
      }
      setError(err?.response?.data?.message || 'Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentCode = activeTab === 'pageObject' ? result?.pageObject : result?.testFile;

  const handleCopy = () => {
    if (!currentCode) return;
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    if (!result) return;
    const ext = framework === 'selenium' ? 'java' : 'ts';
    const content = `// ========== PAGE OBJECT ==========\n${result.pageObject}\n\n// ========== TEST SUITE ==========\n${result.testFile}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProGate status={status} loading={subLoading} showTrialBadge>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Code className="w-6 h-6 text-violet-600" />
          </div>
          Automation Code Generator
        </h1>
        <p className="text-slate-500 mt-2">Generate production-ready Playwright or Selenium automation code using Page Object Model.</p>
      </div>

      {/* Input Panel */}
      <Card className="border-none shadow-xl">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Framework</label>
            <select
              className="w-full h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-violet-500 outline-none text-sm"
              value={framework}
              onChange={e => setFramework(e.target.value)}
            >
              <option value="playwright">Playwright (TypeScript)</option>
              <option value="selenium">Selenium (Java)</option>
            </select>
          </div>
          <JiraContextInput value={input} onChange={setInput} />
          <Button
            className="w-full font-bold h-11 shadow-lg shadow-violet-500/20 bg-violet-600 hover:bg-violet-700"
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <><Loader2 className="animate-spin mr-2 w-4 h-4" />Generating Code...</>
            ) : (
              <><Bot className="w-4 h-4 mr-2" />Generate Automation Code</>
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

      {/* Code Output */}
      {result && (
        <Card className="border-none shadow-xl overflow-hidden">
          {/* Tabs + Actions */}
          <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
            <div className="flex">
              {(['pageObject', 'testFile'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCopied(false); }}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold mr-1 transition-colors ${
                    activeTab === tab
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'pageObject' ? '📄 Page Object' : '🧪 Test Suite'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                Copy
              </Button>
              <Button size="sm" className="h-7 text-xs bg-violet-600 hover:bg-violet-700 text-white" onClick={downloadFile}>
                <FileDown className="w-3.5 h-3.5 mr-1.5" /> Download
              </Button>
            </div>
          </div>

          {/* Code Block */}
          <div className="bg-slate-950 overflow-auto max-h-[600px]">
            <pre className="p-6 font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed">
              {currentCode}
            </pre>
          </div>
        </Card>
      )}
      </ProGate>
    </div>
  );
}), { ssr: false });

export default CodeGeneratorPage;
