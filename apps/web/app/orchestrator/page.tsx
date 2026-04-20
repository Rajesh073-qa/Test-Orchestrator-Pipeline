'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Database, 
  Bot, 
  Code, 
  FileDown, 
  CheckCircle2, 
  Circle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Globe,
  Mail,
  Key,
  ChevronRight,
  Layout,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { jiraApi } from "@/features/jira/services/jira-api";
import { aiApi, codeApi } from "@/services/ai-code-api";
import Link from 'next/link';
import AuthGuard from "@/components/auth-guard";

const STEPS_JIRA = [
  { id: 'project', title: 'Project', icon: Layout },
  { id: 'mode', title: 'Method', icon: Zap },
  { id: 'jira', title: 'Jira', icon: Settings },
  { id: 'stories', title: 'Stories', icon: Database },
  { id: 'plan', title: 'Test Plan', icon: Bot },
  { id: 'cases', title: 'Test Cases', icon: Bot },
  { id: 'code', title: 'Code', icon: Code },
  { id: 'export', title: 'Export', icon: FileDown },
];

const STEPS_MANUAL = [
  { id: 'project', title: 'Project', icon: Layout },
  { id: 'mode', title: 'Method', icon: Zap },
  { id: 'input', title: 'Input', icon: Database },
  { id: 'plan', title: 'Test Plan', icon: Bot },
  { id: 'cases', title: 'Test Cases', icon: Bot },
  { id: 'code', title: 'Code', icon: Code },
  { id: 'export', title: 'Export', icon: FileDown },
];

export default function OrchestratorPage() {
  const [mode, setMode] = useState<'jira' | 'manual' | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State for workflow data
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [jiraStatus, setJiraStatus] = useState<any>(null);
  const [rawInput, setRawInput] = useState('');
  const [structuredData, setStructuredData] = useState<any>(null);
  const [testPlan, setTestPlan] = useState<any>(null);
  const [testCases, setTestCases] = useState([]);
  const [generatedCode, setGeneratedCode] = useState<any>(null);

  const steps = mode === 'manual' ? STEPS_MANUAL : STEPS_JIRA;
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const jStatus = await jiraApi.getStatus();
        setJiraStatus(jStatus);
      } catch (err) {}
    };
    checkStatus();
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const markCompleted = (stepId: string) => {
    setCompletedSteps(prev => [...new Set([...prev, stepId])]);
  };

  // --- Step Handlers ---

  const createProject = async () => {
    if (!projectName) return;
    setLoading(true);
    try {
      const { data } = await api.post('/projects', { name: projectName });
      setProjectId(data.id);
      markCompleted('project');
      handleNext();
    } catch (err) {
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const parseManualInput = async () => {
    if (!rawInput) return;
    setLoading(true);
    try {
      const { data } = await api.post('/ai/parse', { rawInput });
      setStructuredData(data);
      markCompleted('input');
      handleNext();
    } catch (err) {
      alert('Failed to parse requirements. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  const generateTestPlan = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await api.post('/ai/generate-test-plan', { 
        projectId, 
        structuredData: mode === 'manual' ? structuredData : undefined 
      });
      setTestPlan(data);
      markCompleted('plan');
      handleNext();
    } catch (err) {
      alert('Failed to generate test plan');
    } finally {
      setLoading(false);
    }
  };

  const importStories = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      await jiraApi.importStories(projectId, 'PROJ'); // Hardcoded for demo
      markCompleted('stories');
      handleNext();
    } catch (err) {
      alert('Failed to import stories');
    } finally {
      setLoading(false);
    }
  };

  const generateTestCases = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      // In a real app, we'd loop through stories or trigger a bulk job
      // For the demo/manual flow, we use the project context
      await api.post('/ai/generate-test-cases', { projectId });
      markCompleted('cases');
      handleNext();
    } catch (err) {
      alert('Failed to generate test cases');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      await api.post(`/code-generator/project/${projectId}`);
      markCompleted('code');
      handleNext();
    } catch (err) {
      alert('Failed to generate automation code');
    } finally {
      setLoading(false);
    }
  };

  const exportCode = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/code-generator/export-project/${projectId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orchestor-${projectId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      markCompleted('export');
    } catch (err) {
      alert('Failed to export code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto py-12 px-6">
        {/* --- Workflow Progress --- */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Test Automation Orchestrator</h1>
            <span className="text-sm font-medium text-slate-500">Step {currentStep + 1} of {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === i;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => i <= Math.max(...completedSteps.map(s => steps.findIndex(st => st.id === s))) + 1 && setCurrentStep(i)}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isCompleted ? "bg-primary border-primary text-white" : 
                    isActive ? "border-primary text-primary bg-primary/5" : 
                    "border-slate-200 text-slate-400"
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isActive ? "text-primary" : "text-slate-400"
                  )}>{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="min-h-[500px]">
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-2xl overflow-hidden">
                <div className="bg-primary/5 p-8 border-b border-primary/10">
                  <Layout className="w-12 h-12 text-primary mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900">Initialize Your Project</h2>
                  <p className="text-slate-500 mt-2">Start by giving your automation workspace a name.</p>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <input
                      type="text"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="e.g. E-Commerce Web Automation"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <Button className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20" onClick={createProject} disabled={loading || !projectName}>
                    {loading ? <Loader2 className="animate-spin" /> : <>Create Project <ArrowRight className="ml-2 w-5 h-5" /></>}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">How do you want to start?</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card 
                  className={cn(
                    "cursor-pointer hover:border-primary/50 transition-all border-2",
                    mode === 'jira' ? "border-primary bg-primary/5 shadow-xl" : "border-slate-100"
                  )}
                  onClick={() => { setMode('jira'); markCompleted('mode'); handleNext(); }}
                >
                  <CardContent className="p-10 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <Settings className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Jira Integration</h3>
                      <p className="text-slate-500 mt-2 text-sm">Sync directly from your backlog and keep requirements updated.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={cn(
                    "cursor-pointer hover:border-primary/50 transition-all border-2",
                    mode === 'manual' ? "border-primary bg-primary/5 shadow-xl" : "border-slate-100"
                  )}
                  onClick={() => { setMode('manual'); markCompleted('mode'); handleNext(); }}
                >
                  <CardContent className="p-10 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                      <Database className="w-8 h-8 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Manual Requirement</h3>
                      <p className="text-slate-500 mt-2 text-sm">Paste any raw text or feature request to generate test cases immediately.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {mode === 'jira' && currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <Card className="border-none shadow-2xl overflow-hidden">
                  <div className="bg-blue-50 p-8 border-b border-blue-100">
                    <Settings className="w-12 h-12 text-blue-600 mb-4" />
                    <h2 className="text-3xl font-bold text-slate-900">Connect to Jira</h2>
                    <p className="text-slate-500 mt-2">Sync requirements directly from your backlog.</p>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    {jiraStatus?.connected ? (
                      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          <div>
                            <p className="font-bold text-emerald-900">Connected to Jira</p>
                            <p className="text-sm text-emerald-600">{jiraStatus.host}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="rounded-xl" onClick={handleNext}>Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
                      </div>
                    ) : (
                      <div className="space-y-6 text-center">
                        <p className="text-slate-500 py-8">Please configure your Jira connection in Settings.</p>
                        <Link href="/dashboard/settings" className="block">
                           <Button variant="outline" className="w-full h-12 rounded-xl">Go to Settings</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
               </Card>
            </div>
          )}

          {mode === 'manual' && currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-2xl overflow-hidden">
                <div className="bg-violet-50 p-8 border-b border-violet-100">
                  <Database className="w-12 h-12 text-violet-600 mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900">Enter Requirements</h2>
                  <p className="text-slate-500 mt-2">Paste raw requirements, user stories, or feature requests below.</p>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-sm font-medium">Requirement Text</label>
                      <span className="text-xs text-slate-400">{rawInput.length} characters</span>
                    </div>
                    <textarea
                      className="w-full h-64 p-6 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-sm leading-relaxed"
                      placeholder="e.g. As a user, I want to be able to reset my password via email link so that I can regain access if I forget it..."
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20" 
                      onClick={parseManualInput} 
                      disabled={loading || rawInput.length < 10}
                    >
                      {loading ? <Loader2 className="animate-spin mr-2" /> : <Bot className="w-5 h-5 mr-2" />}
                      Parse & Generate Plan
                    </Button>
                  </div>
                  <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
                    AI will convert your unstructured text into a structured QA roadmap
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {mode === 'jira' && currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-2xl overflow-hidden">
                  <div className="bg-amber-50 p-8 border-b border-amber-100">
                    <Database className="w-12 h-12 text-amber-600 mb-4" />
                    <h2 className="text-3xl font-bold text-slate-900">Import User Stories</h2>
                    <p className="text-slate-500 mt-2">Choose which stories to automate.</p>
                  </div>
                  <CardContent className="p-8 text-center flex flex-col items-center gap-6">
                    <div className="p-4 bg-slate-50 rounded-full">
                        <Database className="w-16 h-16 text-slate-200" />
                    </div>
                    <div className="max-w-sm">
                        <p className="text-slate-500 mb-6">Connected to Jira project. Ready to fetch latest requirements?</p>
                        <Button className="w-full h-12 rounded-xl font-bold" onClick={importStories} disabled={loading}>
                          {loading ? <Loader2 className="animate-spin" /> : <>Fetch Stories <RefreshCw className="ml-2 w-5 h-5" /></>}
                        </Button>
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}

          {/* Step: Generate Test Plan */}
          {((mode === 'manual' && currentStep === 3) || (mode === 'jira' && currentStep === 4)) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-20">
                <Bot className="w-20 h-20 text-primary mx-auto mb-6 opacity-20" />
                <h3 className="text-3xl font-bold text-slate-900 mb-2">Create Test Plan</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  We'll use AI to analyze the requirements and build a comprehensive test strategy.
                </p>
                <Button size="lg" className="rounded-xl h-14 px-10 shadow-xl shadow-primary/20 font-bold" onClick={generateTestPlan} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <>Generate Test Plan <ArrowRight className="ml-2 w-5 h-5" /></>}
                </Button>
            </div>
          )}

          {/* Step: Generate Test Cases */}
          {((mode === 'manual' && currentStep === 4) || (mode === 'jira' && currentStep === 5)) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-20">
                <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6 opacity-20" />
                <h3 className="text-3xl font-bold text-slate-900 mb-2">Generate Test Cases</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Transforming the test plan into detailed step-by-step test cases for your features.
                </p>
                <Button size="lg" className="rounded-xl h-14 px-10 shadow-xl shadow-emerald-500/20 font-bold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={generateTestCases} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <>Generate Test Cases <ArrowRight className="ml-2 w-5 h-5" /></>}
                </Button>
            </div>
          )}

          {/* Step: Generate Code */}
          {((mode === 'manual' && currentStep === 5) || (mode === 'jira' && currentStep === 6)) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-20">
                <Code className="w-20 h-20 text-blue-600 mx-auto mb-6 opacity-20" />
                <h3 className="text-3xl font-bold text-slate-900 mb-2">Generate Automation Code</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Creating Playwright Page Object Model scripts for the generated test cases.
                </p>
                <Button size="lg" className="rounded-xl h-14 px-10 shadow-xl shadow-blue-500/20 font-bold bg-blue-600 hover:bg-blue-700 text-white" onClick={generateCode} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <>Generate Playwright Code <ArrowRight className="ml-2 w-5 h-5" /></>}
                </Button>
            </div>
          )}

          {/* Step: Export */}
          {((mode === 'manual' && currentStep === 6) || (mode === 'jira' && currentStep === 7)) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-20">
                <FileDown className="w-20 h-20 text-slate-900 mx-auto mb-6 opacity-20" />
                <h3 className="text-3xl font-bold text-slate-900 mb-2">Export Complete Suite</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Your automation project is ready. Download the ZIP file and run it locally.
                </p>
                <Button size="lg" className="rounded-xl h-14 px-10 shadow-xl shadow-slate-900/20 font-bold bg-slate-900 hover:bg-slate-800 text-white" onClick={exportCode} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <>Download ZIP Suite <FileDown className="ml-2 w-5 h-5" /></>}
                </Button>
                <div className="mt-8">
                  <Link href="/jobs">
                    <Button variant="link" className="text-slate-400">View Generation Logs in Jobs</Button>
                  </Link>
                </div>
            </div>
          )}
        </div>

        {/* --- Footer Navigation --- */}
        {currentStep > 0 && (
          <div className="mt-12 flex justify-between">
            <Button variant="ghost" onClick={handleBack} className="text-slate-400 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous Step
            </Button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
