import { api } from "@/services/api";

export interface JiraConfig {
  baseUrl: string;   // matches backend ConnectJiraDto.baseUrl
  email: string;
  apiToken: string;
}

export const jiraApi = {
  getStatus: async () => {
    const { data } = await api.get('/jira/status');
    return data;
  },
  connect: async (config: JiraConfig) => {
    const { data } = await api.post('/jira/connect', config);
    return data;
  },
  getProjects: async () => {
    const { data } = await api.get('/jira/projects');
    return data;
  },
  importStories: async (projectId: string, jiraProjectKey: string) => {
    const { data } = await api.post(`/jira/stories/${projectId}?jiraKey=${encodeURIComponent(jiraProjectKey)}`);
    return data;
  },
  getIssue: async (issueKey: string) => {
    const { data } = await api.get(`/jira/issue/${encodeURIComponent(issueKey)}`);
    return data;
  },
};
