export interface User {
  id: string;
  email: string;
  role: 'Admin' | 'QA' | 'Viewer';
}

export interface JiraStory {
  id: string;
  jiraId: string;
  summary: string;
  description: string;
  acceptanceCriteria: string[];
  issueType: string;
  priority: string;
  labels: string[];
}

export interface TestPlan {
  id: string;
  storyId: string;
  objective: string;
  scope: string;
  strategy: string;
  status: 'Draft' | 'Reviewed' | 'Approved';
}

export interface TestCaseStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: string;
  testPlanId: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  type: 'Positive' | 'Negative' | 'Edge';
  linkedJiraId?: string;
  steps: TestCaseStep[];
}

export interface AutomationScript {
  id: string;
  testCaseId: string;
  codePayload: string;
}
