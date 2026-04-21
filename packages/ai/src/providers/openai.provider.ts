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
    const systemMessage = `You are a Senior QA Architect. 
    Return ONLY valid JSON representing a professional Test Plan. 
    No explanations or preamble.`;
    
    return this.callOpenAI(storyContext, systemMessage);
  }

  async generateTestCases(storyContext: string): Promise<string> {
    const systemMessage = `You are a Senior QA Engineer. 
    Generate Positive, Negative, and Edge case test cases based on the provided story.
    Return ONLY valid JSON as an array of test cases. 
    No explanations or preamble.`;
    
    return this.callOpenAI(storyContext, systemMessage);
  }

  async generateAutomationCode(testCaseContext: string): Promise<string> {
    const systemMessage = `You are a Senior Automation Engineer. 
    Generate Playwright automation code using Page Object Model.
    Return ONLY valid JSON with 'code' and 'explanation' fields.`;
    
    return this.callOpenAI(testCaseContext, systemMessage);
  }

  async parseRequirement(rawInput: string): Promise<string> {
    const systemMessage = `You are a Senior Product Architect. 
    Take the provided unstructured requirement text and convert it into a structured user story format.
    Return ONLY valid JSON with the following fields:
    {
      "title": "Short descriptive title",
      "description": "Full detailed description in 'As a, I want, So that' format",
      "acceptanceCriteria": ["list", "of", "criteria"],
      "notes": "Any technical or business notes"
    }`;
    
    return this.callOpenAI(rawInput, systemMessage);
  }
}
