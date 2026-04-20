'use client';

import { useState, useEffect, use } from 'react';
import { 
  Folder, 
  Database, 
  Bot, 
  Code, 
  ArrowLeft, 
  Plus, 
  RefreshCw, 
  Loader2,
  CheckCircle2,
  PlayCircle,
  FileDown,
  ExternalLink
} from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/services/api";
import { aiApi, codeApi } from "@/services/ai-code-api";
import { jiraApi } from "@/features/jira/services/jira-api";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [jiraConnected, setJiraConnected] = useState(false);

  useEffect(() => {
    fetchProject();
    checkJiraStatus();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      console.error('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const checkJiraStatus = async () => {
    try {
      const data = await jiraApi.getStatus();
      setJiraConnected(data.connected);
    } catch (err) {}
  };

  const handleImportStories = async () => {
    if (!jiraConnected) {
      alert('Please connect Jira in Settings first.');
      return;
    }
    setActionLoading('import');
    try {
      // Mocking a Jira Project ID for now, in real app this would be a dropdown
      await jiraApi.importStories(id, 'PROJ'); 
      alert('Stories import job started!');
    } catch (err) {
      alert('Failed to start import.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateTests = async () => {
    setActionLoading('generate');
    try {
      await aiApi.generateTestPlan(id);
      alert('Test generation job started!');
    } catch (err) {
      alert('Failed to start generation.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportCode = async () => {
    setActionLoading('export');
    try {
      const blob = await codeApi.exportProject(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project-${id}-tests.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export code.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  if (!project) return <div className="p-20 text-center">Project not found.</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                Project
              </span>
            </div>
            <p className="text-slate-500">{project.description || 'Manage requirements and automation for this project.'}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={handleImportStories}
            disabled={actionLoading === 'import'}
          >
            {actionLoading === 'import' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-blue-500" />}
            Import Stories
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleGenerateTests}
            disabled={actionLoading === 'generate'}
          >
            {actionLoading === 'generate' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 text-violet-500" />}
            Generate Tests
          </Button>
          <Button 
            className="gap-2 shadow-lg shadow-primary/20"
            onClick={handleExportCode}
            disabled={actionLoading === 'export'}
          >
            {actionLoading === 'export' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
            Export Code
          </Button>
        </div>
      </div>

      {/* --- Workflow Progress --- */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { 
            step: 1, 
            title: 'Requirements', 
            desc: 'Sync stories from Jira or add manually.', 
            done: true,
            icon: Database,
            action: 'Manage Stories'
          },
          { 
            step: 2, 
            title: 'Test Cases', 
            desc: 'AI-generated test plans and cases.', 
            done: false,
            icon: Bot,
            action: 'Review Cases'
          },
          { 
            step: 3, 
            title: 'Automation', 
            desc: 'Playwright/Cypress script generation.', 
            done: false,
            icon: Code,
            action: 'View Scripts'
          }
        ].map((step, i) => (
          <Card key={i} className={`relative overflow-hidden border-none shadow-sm ${step.done ? 'bg-white' : 'bg-slate-50 opacity-80'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${step.done ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {step.step}
                </div>
                {step.done && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              </div>
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <CardDescription>{step.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="link" className="p-0 h-auto text-primary font-bold text-xs uppercase tracking-wider group">
                {step.action} <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- Tab Content Placeholder --- */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b">
          <div className="flex gap-8">
            <button className="text-sm font-bold text-primary border-b-2 border-primary pb-4 -mb-4">Stories</button>
            <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-4">Test Cases</button>
            <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-4">Jobs</button>
          </div>
        </CardHeader>
        <CardContent className="p-10 text-center flex flex-col items-center gap-4">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-slate-200" />
           </div>
           <div className="space-y-1">
              <p className="font-bold text-slate-900 text-lg">Work in Progress</p>
              <p className="text-sm text-slate-500 max-w-sm">This project doesn't have any stories yet. Use the buttons above to start your workflow.</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
