import { api } from "@/services/api";

export interface TestCaseStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface AutomationScript {
  id: string;
  language: string;
  framework: string;
  code: string;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  priority: string;
  type: string;
  status: string;
  createdAt: string;
  steps: TestCaseStep[];
  automationScripts?: AutomationScript[];
}

export const testCaseApi = {
  getTestCases: async (projectId?: string): Promise<TestCase[]> => {
    // For MVP, if no projectId, we might fetch all for user or handle via project details
    const { data } = await api.get('/test-case'); // Assuming this endpoint exists or will be added
    return data;
  },
  getTestCase: async (id: string): Promise<TestCase> => {
    const { data } = await api.get(`/test-case/${id}`);
    return data;
  },
  updateTestCase: async (id: string, updates: Partial<TestCase>): Promise<TestCase> => {
    const { data } = await api.patch(`/test-case/${id}`, updates);
    return data;
  },
  generateCode: async (testCaseId: string, force = false) => {
    const { data } = await api.post(`/code-generator/${testCaseId}?force=${force}`);
    return data;
  },
  downloadExport: async (testCaseId: string, fileName: string) => {
    const response = await api.get(`/code-generator/export/${testCaseId}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

