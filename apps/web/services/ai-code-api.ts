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
  quickGenerateTestPlan: async (text: string) => {
    const { data } = await api.post('/ai/quick/test-plan', { text });
    return data;
  },
  quickGenerateTestCases: async (text: string) => {
    const { data } = await api.post('/ai/quick/test-cases', { text });
    return data;
  },
  quickGenerateCode: async (text: string, framework: string) => {
    const { data } = await api.post('/ai/quick/code', { text, framework });
    return data;
  }
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
