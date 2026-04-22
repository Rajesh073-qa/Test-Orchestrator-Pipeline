import { api } from "./api";

export interface Job {
  id: string;
  type: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  total: number;
  result?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export const jobApi = {
  getMyJobs: async (): Promise<Job[]> => {
    const { data } = await api.get('/jobs');
    return data;
  },
  getJobStatus: async (id: string): Promise<Job> => {
    const { data } = await api.get(`/jobs/${id}`);
    return data;
  },
  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },
};
