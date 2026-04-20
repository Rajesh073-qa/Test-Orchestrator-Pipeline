import { AIProviderInterface } from '../interfaces/ai.interface';

export class AIService {
  constructor(private readonly provider: AIProviderInterface) {}

  async generateTestPlan(storyContext: string): Promise<string> {
    return this.provider.generateTestPlan(storyContext);
  }

  async generateTestCases(storyContext: string): Promise<string> {
    return this.provider.generateTestCases(storyContext);
  }

  async generateAutomationCode(testCaseContext: string): Promise<string> {
    return this.provider.generateAutomationCode(testCaseContext);
  }

  async parseRequirement(rawInput: string): Promise<string> {
    return this.provider.parseRequirement(rawInput);
  }
}
