'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../services/project-api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Plus, Folder, Loader2, Trash2 } from "lucide-react";

export default function ProjectList() {
  const [newProjectName, setNewProjectName] = useState("");
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

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your test projects and environments.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Project name..."
            className="px-3 py-2 border rounded-md"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <Button 
            onClick={() => createMutation.mutate(newProjectName)}
            disabled={!newProjectName || createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            New Project
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Card key={project.id} className="hover:border-primary/50 transition-colors group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{project.name}</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-4">
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" asChild>
                   <a href={`/dashboard/projects/${project.id}`}>View Details</a>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects?.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground">Get started by creating your first project above.</p>
        </div>
      )}
    </div>
  );
}
