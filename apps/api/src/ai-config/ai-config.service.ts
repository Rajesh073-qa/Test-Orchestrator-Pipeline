import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CryptoService } from '../common/crypto.service';
import {
  AIService as RepoAIService,
  OpenAIProvider,
  MockAIProvider,
  GroqProvider,
  GeminiProvider,
  MistralProvider,
  OpenRouterProvider,
} from '@repo/ai';
import { AIProviderInterface } from '@repo/ai';

export const AI_PROVIDER_MODELS: Record<string, { label: string; models: { id: string; label: string }[] }> = {
  openai: {
    label: 'OpenAI',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
  },
  groq: {
    label: 'Groq',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Versatile)' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Fast)' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ],
  },
  gemini: {
    label: 'Google Gemini',
    models: [
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Best)' },
      { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Exp)' },
    ],
  },
  mistral: {
    label: 'Mistral AI',
    models: [
      { id: 'mistral-large-latest', label: 'Mistral Large (Latest)' },
      { id: 'open-mixtral-8x22b', label: 'Mixtral 8x22B' },
      { id: 'open-mistral-7b', label: 'Mistral 7B (Fast)' },
    ],
  },
  openrouter: {
    label: 'OpenRouter',
    models: [
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (via OpenRouter)' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
      { id: 'google/gemini-flash-1.5', label: 'Gemini 1.5 Flash' },
      { id: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
    ],
  },
  mock: {
    label: 'Mock (No API key needed)',
    models: [{ id: 'mock', label: 'Mock AI' }],
  },
};

@Injectable()
export class AIConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  /** Returns the list of supported providers and their models (safe, no keys). */
  getProviders() {
    return AI_PROVIDER_MODELS;
  }

  /** Get user's saved AI config (masks the API key). */
  async getConfig(userId: string) {
    const config = await this.prisma.aIConfig.findUnique({ where: { userId } });
    if (!config) return { configured: false };
    return {
      configured: true,
      provider: config.provider,
      model: config.model,
      apiKeyMasked: `${'*'.repeat(Math.max(config.apiKey.length - 4, 8))}${config.apiKey.slice(-4)}`,
    };
  }

  /** Save or update user's AI config. Encrypts the API key before storing. */
  async saveConfig(userId: string, provider: string, model: string, apiKey: string) {
    const encrypted = provider === 'mock' ? 'mock' : this.cryptoService.encrypt(apiKey);

    await this.prisma.aIConfig.upsert({
      where: { userId },
      create: { userId, provider, model, apiKey: encrypted },
      update: { provider, model, apiKey: encrypted },
    });

    return { success: true, message: `AI provider saved: ${AI_PROVIDER_MODELS[provider]?.label || provider} — ${model}` };
  }

  /** Delete user's AI config. Falls back to Mock. */
  async deleteConfig(userId: string) {
    await this.prisma.aIConfig.deleteMany({ where: { userId } });
    return { success: true, message: 'AI configuration removed. Falling back to Mock provider.' };
  }

  /**
   * Build and return a live AIService for the given user.
   * Falls back to Mock if no config exists or provider is 'mock'.
   */
  async buildAIService(userId: string): Promise<RepoAIService> {
    const config = await this.prisma.aIConfig.findUnique({ where: { userId } });

    if (!config || config.provider === 'mock') {
      return new RepoAIService(new MockAIProvider());
    }

    const apiKey = this.cryptoService.decrypt(config.apiKey);
    let provider: AIProviderInterface;

    switch (config.provider) {
      case 'openai':
        provider = new OpenAIProvider(apiKey);
        break;
      case 'groq':
        provider = new GroqProvider(apiKey, config.model);
        break;
      case 'gemini':
        provider = new GeminiProvider(apiKey, config.model);
        break;
      case 'mistral':
        provider = new MistralProvider(apiKey, config.model);
        break;
      case 'openrouter':
        provider = new OpenRouterProvider(apiKey, config.model);
        break;
      default:
        provider = new MockAIProvider();
    }

    return new RepoAIService(provider);
  }
}
