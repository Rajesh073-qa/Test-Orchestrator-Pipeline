import { AIProviderInterface } from '../interfaces/ai.interface';

export class OllamaProvider implements AIProviderInterface {
  constructor(
    private readonly baseUrl: string = 'http://localhost:11434',
    private readonly model: string = 'llama3',
  ) {}

  private async callOllama(prompt: string, systemPrompt: string): Promise<string> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/chat`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: false,
          format: 'json',
          options: {
            temperature: 0.1, // Keep it deterministic for structured data
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error('Ollama Provider Error:', error);
      throw new Error(`Failed to connect to Ollama at ${url}. Make sure Ollama is running and the model "${this.model}" is pulled.`);
    }
  }

  async generateTestPlan(requirementContext: string): Promise<string> {
    const systemPrompt = `You are a Senior QA Engineer. Generate a comprehensive Test Plan in JSON format.
    Return ONLY valid JSON.
    Structure: {
      "title": string,
      "objective": string,
      "scope": { "inScope": string[], "outOfScope": string[] },
      "strategy": string,
      "risks": string[],
      "environment": string,
      "entryCriteria": string,
      "exitCriteria": string
    }`;
    return this.callOllama(requirementContext, systemPrompt);
  }

  async generateTestCases(requirementContext: string): Promise<string> {
    const systemPrompt = `You are a Senior QA Engineer. Generate detailed test cases in JSON format.
    Return ONLY a JSON array of test cases.
    Structure: [{
      "title": string,
      "description": string,
      "type": "Positive" | "Negative" | "Edge",
      "priority": "High" | "Medium" | "Low",
      "steps": [{ "stepNumber": number, "action": string, "expectedResult": string }]
    }]`;
    return this.callOllama(requirementContext, systemPrompt);
  }

  async generateAutomationCode(context: string): Promise<string> {
    const systemPrompt = `You are a Senior SDET. Generate automation code in JSON format.
    Return ONLY valid JSON with keys "testFile" and "pageObject".
    Example: { "testFile": "...", "pageObject": "..." }`;
    return this.callOllama(context, systemPrompt);
  }

  async parseRequirement(rawInput: string): Promise<string> {
    const systemPrompt = `You are a Business Analyst. Parse raw input into structured requirements in JSON format.
    Structure: { "title": string, "description": string, "acceptanceCriteria": string[] }`;
    return this.callOllama(rawInput, systemPrompt);
  }
}
