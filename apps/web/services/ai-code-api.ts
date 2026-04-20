import { api } from "@/services/api";

export const aiApi = {
  generateTestPlan: async (projectId: string) => {
    const { data } = await api.post('/ai/test-plan', { projectId });
    return data;
  },
  generateTestCases: async (userStoryId: string) => {
    const { data } = await api.post(`/ai/test-cases/${userStoryId}`);
    return data;
  },
};

export const codeApi = {
  generateCode: async (testCaseId: string) => {
    const { data } = await api.post(`/code-generator/${testCaseId}`);
    return data;
  },
  exportProject: async (projectId: string) => {
    const { data } = await api.get(`/code-generator/export-project/${projectId}`, {
      responseType: 'blob',
    });
    return data;
  },
};
