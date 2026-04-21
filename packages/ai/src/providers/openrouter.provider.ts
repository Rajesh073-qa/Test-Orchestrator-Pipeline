import { AIProviderInterface } from '../interfaces/ai.interface';

/**
 * OpenRouter Provider — routes to 200+ models via a single OpenAI-compatible API.
 * Popular models: openai/gpt-4o, anthropic/claude-3.5-sonnet, google/gemini-flash-1.5
 * Docs: https://openrouter.ai/docs
 */
export class OpenRouterProvider implements AIProviderInterface {
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly model: string;

  constructor(private readonly apiKey: string, model = 'openai/gpt-4o-mini') {
    this.model = model;
  }

  private async callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://orchestor.app',
        'X-Title': 'Orchestor QA Platform',
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
      throw new Error(`OpenRouter API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices[0].message.content || '';
  }

  async generateTestPlan(storyContext: string): Promise<string> {
    return this.callOpenRouter(
      `You are a Senior QA Architect. Return ONLY valid JSON representing a comprehensive Test Plan with fields: title, objective, scope (inScope: string[], outOfScope: string[]), strategy, risks: string[], environment, entryCriteria, exitCriteria. No explanation.`,
      storyContext,
    );
  }

  async generateTestCases(storyContext: string): Promise<string> {
    return this.callOpenRouter(
      `You are a Senior QA Engineer. Generate Positive, Negative, and Edge case test cases. Return ONLY valid JSON as an array. Each item: { title, description, type (Positive|Negative|Edge), priority (High|Medium|Low), steps: [{ stepNumber, action, expectedResult }] }. No explanation.`,
      storyContext,
    );
  }

  async generateAutomationCode(context: string): Promise<string> {
    return this.callOpenRouter(
      `You are a Senior Automation Engineer. Generate automation code using Page Object Model. Return ONLY valid JSON: { "testFile": "...", "pageObject": "..." }. No explanation.`,
      context,
    );
  }

  async parseRequirement(rawInput: string): Promise<string> {
    return this.callOpenRouter(
      `You are a Senior Product Architect. Convert unstructured text to a user story. Return ONLY valid JSON: { "title": "", "description": "", "acceptanceCriteria": [], "notes": "" }. No explanation.`,
      rawInput,
    );
  }
}
