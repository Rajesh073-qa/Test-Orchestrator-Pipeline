import { AIProviderInterface } from '../interfaces/ai.interface';

/**
 * Google Gemini Provider — uses Gemini's generateContent REST API.
 * Models: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp
 * Docs: https://ai.google.dev/api/generate-content
 */
export class GeminiProvider implements AIProviderInterface {
  private readonly model: string;

  constructor(private readonly apiKey: string, model = 'gemini-1.5-flash') {
    this.model = model;
  }

  private get baseUrl(): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
  }

  private async callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text;
  }

  async generateTestPlan(storyContext: string): Promise<string> {
    return this.callGemini(
      `You are a Senior QA Architect. Return ONLY valid JSON representing a comprehensive Test Plan with fields: title, objective, scope (inScope: string[], outOfScope: string[]), strategy, risks: string[], environment, entryCriteria, exitCriteria. No explanation.`,
      storyContext,
    );
  }

  async generateTestCases(storyContext: string): Promise<string> {
    return this.callGemini(
      `You are a Senior QA Engineer. Generate Positive, Negative, and Edge case test cases. Return ONLY valid JSON as an array. Each item: { title, description, type (Positive|Negative|Edge), priority (High|Medium|Low), steps: [{ stepNumber, action, expectedResult }] }. No explanation.`,
      storyContext,
    );
  }

  async generateAutomationCode(context: string): Promise<string> {
    return this.callGemini(
      `You are a Senior Automation Engineer. Generate automation code using Page Object Model. Return ONLY valid JSON: { "testFile": "...", "pageObject": "..." }. No explanation.`,
      context,
    );
  }

  async parseRequirement(rawInput: string): Promise<string> {
    return this.callGemini(
      `You are a Senior Product Architect. Convert unstructured text to a user story. Return ONLY valid JSON: { "title": "", "description": "", "acceptanceCriteria": [], "notes": "" }. No explanation.`,
      rawInput,
    );
  }
}
