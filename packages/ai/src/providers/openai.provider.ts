import OpenAI from 'openai';
import { AIProviderInterface } from '../interfaces/ai.interface';

export class OpenAIProvider implements AIProviderInterface {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  private async callOpenAI(prompt: string, systemMessage: string): Promise<string> {
    if (this.openai.apiKey === 'sk-xxx') {
      console.warn('⚠️ OpenAI Simulation Mode active (sk-xxx key)');
      
      // Return appropriate mocks based on system message content
      if (systemMessage.includes('Product Architect')) {
        return JSON.stringify({
          title: "Automated User Login",
          description: "As a registered user, I want to login with my credentials so that I can access my dashboard.",
          acceptanceCriteria: ["Valid email/password", "Error message on invalid", "Redirect to /dashboard"],
          notes: "Simulation data"
        });
      }
      
      if (systemMessage.includes('QA Architect')) {
        return JSON.stringify({
          title: "Test Plan: Automated User Login",
          objective: "To verify that users can securely authenticate using valid credentials.",
          scope: {
            inScope: ["Login page", "API endpoints", "Session management"],
            outOfScope: ["Password recovery flow", "Social login integration"]
          },
          strategy: "Automated functional testing using Playwright with POM.",
          risks: ["Slow network latency", "Browser compatibility issues"],
          environment: "Staging/QA Environment",
          entryCriteria: "Stable build deployed to QA.",
          exitCriteria: "All priority High and Medium tests passing."
        });
      }

      if (systemMessage.includes('QA Engineer')) {
        return JSON.stringify([
          { 
            title: "Successful login with valid credentials", 
            description: "Verify that a user can login with a valid email and password.",
            type: "Positive", 
            priority: "High",
            steps: [
              { stepNumber: 1, action: "Navigate to /login", expectedResult: "Login page visible" },
              { stepNumber: 2, action: "Enter valid credentials and click Login", expectedResult: "Redirected to dashboard" }
            ]
          },
          { 
            title: "Failed login with invalid password", 
            description: "Verify that login fails with an incorrect password.",
            type: "Negative", 
            priority: "Medium",
            steps: [
              { stepNumber: 1, action: "Navigate to /login", expectedResult: "Login page visible" },
              { stepNumber: 2, action: "Enter invalid password and click Login", expectedResult: "Error message 'Invalid credentials' shown" }
            ]
          }
        ]);
      }

      return JSON.stringify({ code: "// Simulated Playwright code\nawait page.goto('/login');" });
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    return response.choices[0].message.content || '';
  }

  async generateTestPlan(storyContext: string): Promise<string> {
    const systemMessage = `You are a world-class Senior QA Architect with decades of experience in enterprise systems.
    Create a highly professional, exhaustive, and detailed Test Plan. 
    Analyze the technical architecture, business risks, and operational constraints.
    The objective should be strategic. The scope must be crystal clear.
    The strategy should include layers of testing (Unit, Integration, E2E, Performance, Security).
    Risks must include technical debt, scalability, and integration failures.
    Return ONLY valid JSON with fields: { 
      title, 
      objective, 
      scope: { inScope: string[], outOfScope: string[] }, 
      strategy, 
      risks: string[], 
      environment, 
      entryCriteria, 
      exitCriteria,
      testSchedule: string,
      defectManagementProcess: string
    }.`;
    
    return this.callOpenAI(storyContext, systemMessage);
  }

  async generateTestCases(storyContext: string): Promise<string> {
    const systemMessage = `You are an expert Senior QA Engineer specializing in high-coverage, mission-critical testing.
    Analyze the provided context and generate an exhaustive set of Positive, Negative, Boundary, and technical Edge Case test cases.
    Each test case must include:
    - exhaustive description
    - preConditions (string)
    - priority (High/Medium/Low)
    - type (Functional/Non-Functional/Security/Performance)
    - dataScenarios (string[])
    - precise, atomic steps with expected results.
    Return ONLY valid JSON as an array of objects: { 
      title, 
      description, 
      preConditions,
      type, 
      priority, 
      dataScenarios: string[],
      steps: [{ stepNumber, action, expectedResult }] 
    }.`;
    
    return this.callOpenAI(storyContext, systemMessage);
  }

  async generateAutomationCode(testCaseContext: string): Promise<string> {
    const systemMessage = `You are an elite Senior Automation Architect. 
    Generate clean, enterprise-grade, maintainable automation code using the Page Object Model (POM) pattern.
    The code must follow industry best practices:
    - Robust selectors (data-testid preferred).
    - Auto-waiting and resilience.
    - Detailed JSDoc comments for every method.
    - Proper error handling and logging.
    If multiple pages are involved, use separate objects. 
    Return ONLY valid JSON with 'testFile' (full test implementation) and 'pageObject' (reusable elements/methods) fields.`;
    
    return this.callOpenAI(testCaseContext, systemMessage);
  }

  async parseRequirement(rawInput: string): Promise<string> {
    const systemMessage = `You are an elite Senior Product Architect at a top-tier software company. 
    Your task is to transform raw, unstructured technical requirements into a world-class User Story. 
    The output must be technically precise, comprehensive, and clear.
    Return ONLY a valid JSON object with these EXACT fields:
    {
      "title": "A concise, high-impact title",
      "description": "Full detailed description using the standard 'As a [Role], I want to [Action], so that [Benefit]' format. Include business value.",
      "acceptanceCriteria": ["Comprehensive list of testable criteria, including functional, performance, and security constraints"],
      "notes": "Deep technical considerations, architectural dependencies, or edge cases to watch out for"
    }`;
    
    return this.callOpenAI(rawInput, systemMessage);
  }
  async generateCustomResponse(prompt: string, systemMessage: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0].message.content || '';
  }
}
