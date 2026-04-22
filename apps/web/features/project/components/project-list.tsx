'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../services/project-api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Plus, Folder, Loader2, Trash2, Calendar, Layout, ArrowRight, Search, Edit2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

export default function ProjectList() {
  const [newProjectName, setNewProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.getProjects,
  });

  const createMutation = useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setNewProjectName("");
      toast({ type: 'success', title: 'Project Created', message: `Navigating to ${data.name}` });
      router.push(`/dashboard/projects/${data.id}`);
    },
    onError: (err: any) => {
      toast({ type: 'error', title: 'Creation Failed', message: err?.response?.data?.message || 'Could not create project.' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: projectApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const [editingProject, setEditingProject] = useState<any>(null);

  const updateMutation = useMutation({
    mutationFn: ({ id, name, description }: { id: string, name: string, description?: string }) => projectApi.updateProject(id, name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ type: 'success', title: 'Project Updated', message: 'The project details were successfully updated.' });
      setEditingProject(null);
    },
  });

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleUpdateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateMutation.mutate({ 
        id: editingProject.id, 
        name: editingProject.name, 
        description: editingProject.description 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
        <p className="text-sm font-medium text-slate-400 animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header with Search and Create */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 font-medium">Manage your automation lifecycle across different domains.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Project Name"
              className="hidden sm:block h-10 px-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <Button 
              className="h-10 font-bold rounded-xl shadow-lg shadow-primary/20"
              onClick={() => createMutation.mutate(newProjectName)}
              disabled={!newProjectName || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredProjects?.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center rounded-3xl">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto">
              <Folder className="h-8 w-8 text-slate-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Create your first project</h3>
              <p className="text-slate-500 mt-1">Start organizing your requirements and automation jobs in a dedicated space.</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <input
                type="text"
                placeholder="Enter Project Name"
                className="h-11 px-4 border border-slate-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-primary outline-none"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <Button 
                size="lg" 
                className="font-bold rounded-xl h-11"
                onClick={() => createMutation.mutate(newProjectName)}
                disabled={!newProjectName || createMutation.isPending}
              >
                Create Project
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects?.map((project) => (
            <Card key={project.id} className="border-none shadow-sm hover:shadow-xl transition-all group relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 group-hover:bg-primary transition-colors" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Layout className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black tracking-tight text-slate-900">{project.name}</CardTitle>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      <Calendar className="w-3 h-3" /> {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-600">Active</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assets</p>
                    <span className="text-xs font-bold text-slate-600">{project.userStories?.length || 0} User Stories</span>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full font-bold h-9 rounded-lg border-slate-200 group-hover:border-primary group-hover:text-primary transition-all">
                      Open Project <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-all" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                      onClick={() => setEditingProject(project)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- Edit Project Modal --- */}
      {editingProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900">Edit Workspace</h3>
              <button onClick={() => setEditingProject(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">✕</button>
            </div>
            <form onSubmit={handleUpdateProjectSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workspace Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full h-14 px-6 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                  value={editingProject.name}
                  onChange={e => setEditingProject({...editingProject, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  className="w-full p-6 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-slate-600 resize-none"
                  rows={4}
                  value={editingProject.description || ""}
                  onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-4">
                <Button type="button" variant="ghost" onClick={() => setEditingProject(null)} className="flex-1 h-14 rounded-2xl font-bold text-slate-500">Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending} className="flex-[2] h-14 rounded-2xl font-black shadow-xl shadow-primary/20">
                  {updateMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
