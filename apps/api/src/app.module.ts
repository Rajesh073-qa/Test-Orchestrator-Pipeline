import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { JiraModule } from './jira/jira.module';
import { AIModule } from './ai/ai.module';
import { CodeGeneratorModule } from './code-generator/code-generator.module';
import { TestCaseModule } from './test-case/test-case.module';
import { CommonModule } from './common/common.module';
import { AIConfigModule } from './ai-config/ai-config.module';
import { PaymentModule } from './payment/payment.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    // Make ConfigModule global so every module can inject ConfigService
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get('REDIS_URL'),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProjectModule,
    JiraModule,
    AIModule,
    CodeGeneratorModule,
    TestCaseModule,
    CommonModule,
    AIConfigModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
