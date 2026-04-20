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
