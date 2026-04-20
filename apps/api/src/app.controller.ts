import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { TestCase } from '@repo/types';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    const test: TestCase = {
      id: '1',
      testPlanId: 'tp-1',
      title: 'Hello cross-package Test Case',
      description: 'Verifying imports',
      priority: 'High',
      type: 'Positive',
      steps: []
    };
    return this.appService.getHello() + ' - ' + test.title;
  }

  @Get('test-db')
  async testDb() {
    // 1. Insert User
    const user = await this.prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'ADMIN',
      },
    });

    // 2. Insert Project
    const project = await this.prisma.project.create({
      data: {
        name: 'Test Project',
        userId: user.id,
      },
    });

    // 3. Insert User Story
    const story = await this.prisma.userStory.create({
      data: {
        title: 'User Story 1',
        projectId: project.id,
      },
    });

    // 4. Insert TestCase with Steps
    const testCase = await this.prisma.testCase.create({
      data: {
        title: 'Login Test',
        description: 'Verify login functionality',
        priority: 'High',
        type: 'Positive',
        userStoryId: story.id,
        steps: {
          create: [
            { stepNumber: 1, description: 'Go to login', expectedResult: 'Page loads' },
            { stepNumber: 2, description: 'Enter credentials', expectedResult: 'Logged in' }
          ]
        }
      },
      include: {
        steps: true
      }
    });


    return {
      message: 'Database Relations Verified Successfully',
      user,
      project,
      testCase
    };
  }
}
