'use client';

import { useState, useEffect, use } from 'react';
import { 
  Folder, Database, Bot, Code, ArrowLeft, Plus, RefreshCw, 
  Loader2, CheckCircle2, PlayCircle, FileDown, ExternalLink,
  BookOpen, Sparkles, Layout, Link2, Download, Trash2, Edit2, Copy, Beaker
} from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/services/api";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stories' | 'testcases' | 'automation'>('stories');
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyForm, setStoryForm] = useState({ title: '', description: '', acceptanceCriteria: '' });
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<any>(null);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: 'Failed to fetch project details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('creating-story');
    try {
      await api.post(`/projects/${id}/stories`, storyForm);
      toast({ type: 'success', title: 'Story Created', message: 'User story successfully added to workspace.' });
      setStoryForm({ title: '', description: '', acceptanceCriteria: '' });
      setShowStoryModal(false);
      fetchProject();
    } catch (err) {
      toast({ type: 'error', title: 'Failed to create story', message: 'An error occurred.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStoryId) return;
    setActionLoading('updating-story');
    try {
      await api.patch(`/projects/stories/${editingStoryId}`, storyForm);
      toast({ type: 'success', title: 'Story Updated', message: 'User story successfully updated.' });
      setStoryForm({ title: '', description: '', acceptanceCriteria: '' });
      setEditingStoryId(null);
      fetchProject();
    } catch (err) {
      toast({ type: 'error', title: 'Update Failed', message: 'An error occurred.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure? This will also delete all test cases for this story.')) return;
    try {
      await api.delete(`/projects/stories/${storyId}`);
      toast({ type: 'success', title: 'Deleted', message: 'Story removed from project.' });
      fetchProject();
    } catch (err) {
      toast({ type: 'error', title: 'Delete Failed', message: 'Error deleting story.' });
    }
  };

  const handleDeleteTestCase = async (id: string) => {
    if (!confirm('Delete this test case?')) return;
    try {
      await api.delete(`/test-case/${id}`);
      toast({ type: 'success', title: 'Deleted', message: 'Test case removed.' });
      fetchProject();
    } catch (err) {
      toast({ type: 'error', title: 'Delete Failed', message: 'Error deleting test case.' });
    }
  };

  const handleUpdateTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestCase) return;
    setActionLoading('updating-tc');
    try {
      await api.patch(`/test-case/${editingTestCase.id}`, editingTestCase);
      toast({ type: 'success', title: 'Updated', message: 'Test case updated successfully.' });
      setEditingTestCase(null);
      fetchProject();
    } catch (err) {
      toast({ type: 'error', title: 'Update Failed', message: 'Error updating test case.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateTestCases = async () => {
    if (project.userStories.length === 0) {
      toast({ type: 'error', title: 'No Stories Found', message: 'Add user stories first to generate test cases.' });
      return;
    }
    setActionLoading('generate-cases');
    try {
      await api.post(`/ai/test-cases/bulk/${id}`);
      toast({ type: 'success', title: 'AI Magic Complete', message: 'Test cases have been generated for all stories!' });
      setActiveTab('testcases');
      fetchProject();
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast({ type: 'error', title: 'Upgrade Required', message: 'You have used your free AI trial. Please upgrade to Pro.' });
      } else {
        toast({ type: 'error', title: 'Generation Failed', message: 'An error occurred during AI processing.' });
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12 opacity-20" /></div>;
  if (!project) return <div className="p-20 text-center font-bold text-slate-500 text-xl">Project not found.</div>;

  const testCases = project.userStories?.flatMap((s: any) => s.testCases?.map((tc: any) => ({ ...tc, storyTitle: s.title }))) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 w-full max-w-7xl mx-auto">
      
      {/* --- Premium Header --- */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex gap-6 items-start">
          <Link href="/dashboard/projects">
            <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12 bg-slate-50 border-slate-200 text-slate-500 hover:text-primary shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{project.name}</h1>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                Active Workspace
              </span>
            </div>
            <p className="text-slate-500 font-medium max-w-xl">{project.description || 'Manage requirements and automation for this project.'}</p>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-3">
          <Link href={`/dashboard/generators/test-plan?projectId=${id}`}>
            <Button variant="outline" className="h-12 px-6 rounded-xl font-bold bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm">
              <Layout className="w-4 h-4 mr-2 text-blue-500" /> Generate Test Plan
            </Button>
          </Link>
          <Button 
            className="h-12 px-6 rounded-xl font-black shadow-lg shadow-primary/20 gap-2"
            onClick={handleGenerateTestCases}
            disabled={actionLoading === 'generate-cases'}
          >
            {actionLoading === 'generate-cases' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-300" />}
            AI Bulk Generate Tests
          </Button>
        </div>
      </div>

      {/* --- Project Analytics Summary --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Stories', value: project.userStories?.length || 0, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Test Cases', value: testCases.length, icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Automation %', value: `${testCases.length > 0 ? Math.round((testCases.filter((tc: any) => tc.automationScripts?.length > 0).length / testCases.length) * 100) : 0}%`, icon: Code, color: 'text-violet-500', bg: 'bg-violet-50' },
          { label: 'AI Health', value: 'Excellent', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- Functional Tabs Content --- */}
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden relative">
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 px-8 flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('stories')}
            className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'stories' ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-100")}
          >
            User Stories ({project.userStories?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('testcases')}
            className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'testcases' ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-100")}
          >
            Generated Test Cases ({testCases.length})
          </button>
          <button 
            onClick={() => setActiveTab('automation')}
            className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'automation' ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-100")}
          >
            Automation Scripts ({testCases.filter((tc: any) => tc.automationScripts?.length > 0).length})
          </button>
        </div>

        <CardContent className="p-8">
          {activeTab === 'stories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-500" /> Workspace Stories</h3>
                <Button onClick={() => setShowStoryModal(true)} className="rounded-xl font-bold"><Plus className="w-4 h-4 mr-2" /> Add Story Manually</Button>
              </div>

              {project.userStories?.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-slate-50">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="font-bold text-slate-700 text-lg mb-2">No Stories Added Yet</p>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Create your first user story to serve as the foundation for AI test case generation.</p>
                  <Button onClick={() => setShowStoryModal(true)} className="rounded-xl font-bold"><Plus className="w-4 h-4 mr-2" /> Add Your First Story</Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {project.userStories?.map((story: any) => (
                    <div key={story.id} className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-lg text-slate-900 mb-1">{story.title}</h4>
                          <p className="text-sm text-slate-600 mb-4 leading-relaxed">{story.description}</p>
                          {story.acceptanceCriteria && (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Acceptance Criteria</span>
                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{story.acceptanceCriteria}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-300 hover:text-blue-500 hover:bg-blue-50"
                            onClick={() => {
                              setStoryForm({ title: story.title, description: story.description || '', acceptanceCriteria: story.acceptanceCriteria || '' });
                              setEditingStoryId(story.id);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteStory(story.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black">
                            {story.testCases?.length || 0} Cases
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'testcases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Database className="w-5 h-5 text-emerald-500" /> Database of Test Cases</h3>
                {testCases.length > 0 && (
                  <Link href={`/dashboard/generators/code?projectId=${id}`}>
                    <Button variant="outline" className="rounded-xl font-bold text-violet-600 border-violet-200 hover:bg-violet-50">
                      <Code className="w-4 h-4 mr-2" /> Export to Code
                    </Button>
                  </Link>
                )}
              </div>

              {testCases.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-slate-50">
                  <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="font-bold text-slate-700 text-lg mb-2">No Test Cases Generated</p>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Switch to the Stories tab and add stories, then click the AI Bulk Generate button.</p>
                  <Button onClick={handleGenerateTestCases} className="rounded-xl font-bold" disabled={project.userStories?.length === 0}>
                    <Sparkles className="w-4 h-4 mr-2" /> Generate Now
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {testCases.map((tc: any, i: number) => (
                    <Card key={tc.id || i} className="border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tc.priority === 'High' ? 'bg-red-50 text-red-500' : tc.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500')}>
                              <Beaker className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 leading-tight">{tc.title}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: TC-{i + 1} | {tc.type || 'Functional'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl text-slate-300 hover:text-blue-500 hover:bg-blue-50"
                              onClick={() => setEditingTestCase(tc)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteTestCase(tc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Detailed Description</span>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium">{tc.description}</p>
                            </div>
                            {tc.preConditions && (
                              <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Pre-Conditions</span>
                                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">{tc.preConditions}</p>
                              </div>
                            )}
                            {tc.dataScenarios && tc.dataScenarios.length > 0 && (
                              <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Data Scenarios</span>
                                <div className="flex flex-wrap gap-2">
                                  {tc.dataScenarios.map((ds: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-bold border border-violet-100">{ds}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">Execution Steps ({tc.steps?.length || 0})</span>
                            <div className="space-y-3">
                              {tc.steps?.map((step: any, idx: number) => (
                                <div key={idx} className="flex gap-3 group/step">
                                  <div className="flex flex-col items-center gap-1 shrink-0">
                                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 text-[10px] font-bold flex items-center justify-center shadow-sm group-hover/step:border-primary group-hover/step:text-primary transition-colors">
                                      {step.stepNumber}
                                    </div>
                                    {idx !== tc.steps.length - 1 && <div className="w-0.5 flex-1 bg-slate-200" />}
                                  </div>
                                  <div className="pb-3 flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-slate-700">{step.description || step.action}</p>
                                    {step.expectedResult && (
                                      <p className="text-[10px] text-slate-400 mt-1 italic">Expected: {step.expectedResult}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Code className="w-5 h-5 text-violet-500" /> Automation Scripts</h3>
              </div>

              {testCases.filter((tc: any) => tc.automationScripts?.length > 0).length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-slate-50">
                  <Code className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="font-bold text-slate-700 text-lg mb-2">No Scripts Generated</p>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Go to Test Cases and use the AI code generator to create scripts for your test cases.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {testCases.filter((tc: any) => tc.automationScripts?.length > 0).map((tc: any) => (
                    <div key={tc.id} className="p-6 border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-slate-900">{tc.title}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2 py-1 rounded uppercase tracking-widest">
                            {tc.automationScripts[0].framework} / {tc.automationScripts[0].language}
                          </span>
                        </div>
                        <div className="flex gap-2">
                           <Button size="sm" variant="outline" className="h-8 text-xs font-bold gap-2" onClick={() => {
                             navigator.clipboard.writeText(tc.automationScripts[0].code);
                             toast({ type: 'success', title: 'Copied', message: 'Script copied to clipboard' });
                           }}>
                             <Copy className="w-4 h-4" /> Copy
                           </Button>
                           <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50" onClick={async () => {
                             if (!confirm('Delete this script?')) return;
                             try {
                               await api.delete(`/code-generator/scripts/${tc.automationScripts[0].id}`);
                               toast({ type: 'success', title: 'Deleted', message: 'Script removed' });
                               fetchProject();
                             } catch (err) {
                               toast({ type: 'error', title: 'Error', message: 'Could not delete script' });
                             }
                           }}>
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                      </div>
                      <div className="bg-slate-950 rounded-2xl p-4 overflow-hidden">
                        <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-[300px]">
                          {tc.automationScripts[0].code}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Add/Edit Story Modal --- */}
      {(showStoryModal || editingStoryId) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-slate-900">{editingStoryId ? 'Edit User Story' : 'Add User Story'}</h3>
              <button onClick={() => { setShowStoryModal(false); setEditingStoryId(null); setStoryForm({ title: '', description: '', acceptanceCriteria: '' }); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">✕</button>
            </div>
            <form onSubmit={editingStoryId ? handleUpdateStory : handleCreateStory} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Story Title *</label>
                <input 
                  required
                  type="text" 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                  placeholder="e.g., As a user, I can log in..."
                  value={storyForm.title}
                  onChange={e => setStoryForm({...storyForm, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                  rows={3}
                  placeholder="Detailed context about this story..."
                  value={storyForm.description}
                  onChange={e => setStoryForm({...storyForm, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Acceptance Criteria</label>
                <textarea 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                  rows={3}
                  placeholder="1. Must do X. 2. Must handle Y error."
                  value={storyForm.acceptanceCriteria}
                  onChange={e => setStoryForm({...storyForm, acceptanceCriteria: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => { setShowStoryModal(false); setEditingStoryId(null); setStoryForm({ title: '', description: '', acceptanceCriteria: '' }); }} className="rounded-xl font-bold">Cancel</Button>
                <Button type="submit" disabled={!!actionLoading} className="rounded-xl font-bold shadow-lg shadow-primary/20 px-8">
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Story'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit Test Case Modal --- */}
      {editingTestCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-slate-900">Edit Test Case</h3>
              <button onClick={() => setEditingTestCase(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">✕</button>
            </div>
            <form onSubmit={handleUpdateTestCase} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title *</label>
                <input 
                  required
                  type="text" 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                  value={editingTestCase.title}
                  onChange={e => setEditingTestCase({...editingTestCase, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</label>
                  <select 
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium bg-white"
                    value={editingTestCase.priority}
                    onChange={e => setEditingTestCase({...editingTestCase, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
                  <select 
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium bg-white"
                    value={editingTestCase.type}
                    onChange={e => setEditingTestCase({...editingTestCase, type: e.target.value})}
                  >
                    <option value="Functional">Functional</option>
                    <option value="UI">UI</option>
                    <option value="API">API</option>
                    <option value="Security">Security</option>
                    <option value="Performance">Performance</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                  rows={3}
                  value={editingTestCase.description}
                  onChange={e => setEditingTestCase({...editingTestCase, description: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setEditingTestCase(null)} className="rounded-xl font-bold">Cancel</Button>
                <Button type="submit" disabled={!!actionLoading} className="rounded-xl font-bold shadow-lg shadow-primary/20 px-8">
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Test Case'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
