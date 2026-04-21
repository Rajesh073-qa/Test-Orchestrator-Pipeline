'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../services/project-api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Plus, Folder, Loader2, Trash2, Calendar, Layout, ArrowRight, Search } from "lucide-react";
import Link from "next/link";

export default function ProjectList() {
  const [newProjectName, setNewProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.getProjects,
  });

  const createMutation = useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setNewProjectName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
                    <span className="text-xs font-bold text-slate-600">4 User Stories</span>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full font-bold h-9 rounded-lg border-slate-200 group-hover:border-primary group-hover:text-primary transition-all">
                      Open Project <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-all" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
