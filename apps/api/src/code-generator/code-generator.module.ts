import { Module } from '@nestjs/common';
import { CodeGeneratorService } from './code-generator.service';
import { CodeGeneratorController } from './code-generator.controller';
import { BullModule } from '@nestjs/bullmq';
import { CodeGeneratorProcessor } from './code-generator.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'code-generation',
    }),
  ],
  controllers: [CodeGeneratorController],
  providers: [CodeGeneratorService, CodeGeneratorProcessor],
  exports: [CodeGeneratorService],
})
export class CodeGeneratorModule {}
