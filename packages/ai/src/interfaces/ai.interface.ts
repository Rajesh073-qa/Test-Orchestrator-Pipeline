export interface AIProviderInterface {
  generateTestPlan(storyContext: string): Promise<string>;
  generateTestCases(storyContext: string): Promise<string>;
  generateAutomationCode(testCaseContext: string): Promise<string>;
  parseRequirement(rawInput: string): Promise<string>;
}
