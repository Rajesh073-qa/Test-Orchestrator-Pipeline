import { api } from "@/services/api";

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  userStories?: any[];
}

export const projectApi = {
  getProjects: async (): Promise<Project[]> => {
    const { data } = await api.get('/projects');
    return data;
  },
  createProject: async (name: string): Promise<Project> => {
    const { data } = await api.post('/projects', { name });
    return data;
  },
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
  updateProject: async (id: string, name: string, description?: string): Promise<Project> => {
    const { data } = await api.patch(`/projects/${id}`, { name, description });
    return data;
  },
  deleteStory: async (storyId: string): Promise<void> => {
    await api.delete(`/projects/stories/${storyId}`);
  },
};
