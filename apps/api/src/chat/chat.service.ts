import { Injectable } from '@nestjs/common';
import { AIService } from '../ai/ai.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly aiService: AIService,
    private readonly prisma: PrismaService,
  ) {}

  async processMessage(userId: string, message: string) {
    const aiServiceScoped = await this.aiService.getAIService(userId);
    
    // Get context (projects, stories etc) to make the agent smarter
    const projects = await this.prisma.project.findMany({
      where: { userId },
      take: 5,
      include: { _count: { select: { userStories: true } } }
    });

    const context = `
      User Workspace Context:
      Projects: ${projects.map(p => `${p.name} (${p._count.userStories} stories)`).join(', ')}
    `;

    const systemMessage = `
      You are "TestOrchestrator AI Agent", an elite QA and Automation assistant.
      You help users manage their testing projects, generate test cases, and explain application features.
      
      Capabilities:
      1. Answer questions about QA best practices.
      2. Explain how to use TestOrchestrator (Project management, AI generation, Jira sync).
      3. Analyze the user's current projects and provide strategic advice.
      
      Current User Context:
      ${context}
      
      Rules:
      - Be concise, professional, and helpful.
      - Use markdown for formatting.
      - If the user asks for something you can't do yet, explain that it's in the roadmap.
    `;

    const response = await aiServiceScoped.generateCustomResponse(message, systemMessage);
    return { response };
  }
}
