import { AIProviderInterface } from '../interfaces/ai.interface';

/**
 * Groq Provider — uses Groq's OpenAI-compatible chat API.
 * Models: llama-3.3-70b-versatile, mixtral-8x7b-32768, gemma2-9b-it
 * Docs: https://console.groq.com/docs/openai
 */
export class GroqProvider implements AIProviderInterface {
  private readonly baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly model: string;

  constructor(private readonly apiKey: string, model = 'llama-3.3-70b-versatile') {
    this.model = model;
  }

  private async callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices[0].message.content || '';
  }

  async generateTestPlan(storyContext: string): Promise<string> {
    return this.callGroq(
      `You are a Senior QA Architect. Create a technical, enterprise-grade Test Plan.
      Return ONLY valid JSON with fields: { title, objective, scope: { inScope: string[], outOfScope: string[] }, strategy, risks: string[], environment, entryCriteria, exitCriteria }.`,
      storyContext,
    );
  }

  async generateTestCases(storyContext: string): Promise<string> {
    return this.callGroq(
      `You are an expert QA Engineer. Generate exhaustive Positive, Negative, and Edge case test cases.
      Return ONLY valid JSON as an array: [{ title, description, type: "Positive"|"Negative"|"Edge", priority: "High"|"Medium"|"Low", steps: [{ stepNumber, action, expectedResult }] }].`,
      storyContext,
    );
  }

  async generateAutomationCode(context: string): Promise<string> {
    return this.callGroq(
      `You are an elite Automation Architect. Generate clean, maintainable automation code using Page Object Model (POM).
      Return ONLY valid JSON: { "testFile": "...", "pageObject": "..." }. Include detailed technical comments.`,
      context,
    );
  }

  async parseRequirement(rawInput: string): Promise<string> {
    return this.callGroq(
      `You are an elite Product Architect. Transform raw technical input into a comprehensive User Story.
      Return ONLY valid JSON: { "title": "", "description": "", "acceptanceCriteria": [], "notes": "" }.`,
      rawInput,
    );
  }
}
