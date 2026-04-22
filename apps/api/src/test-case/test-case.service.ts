import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TestCaseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.testCase.findMany({
      where: {
        userStory: {
          project: { userId }
        }
      },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        automationScripts: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, userId: string) {
    const testCase = await this.prisma.testCase.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        automationScripts: { orderBy: { createdAt: 'desc' }, take: 1 },
        userStory: { include: { project: true } }
      }
    });

    if (!testCase || testCase.userStory?.project.userId !== userId) {
      throw new NotFoundException('Test case not found or access denied');
    }

    return testCase;
  }

  async update(id: string, userId: string, data: any) {
    const testCase = await this.findOne(id, userId);
    
    // Simple update for status/priority/type/description
    return this.prisma.testCase.update({
      where: { id },
      data: {
        title: data.title ?? testCase.title,
        description: data.description ?? testCase.description,
        priority: data.priority ?? testCase.priority,
        type: data.type ?? testCase.type,
      }

    });
  }

  async delete(id: string, userId: string) {
    const testCase = await this.findOne(id, userId);
    return this.prisma.testCase.delete({
      where: { id }
    });
  }
}
