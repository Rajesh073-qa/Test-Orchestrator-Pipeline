import { Module, Global } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { JobService } from './job.service';
import { PrismaService } from '../prisma.service';

import { JobController } from './job.controller';

@Global()
@Module({
  providers: [CryptoService, JobService, PrismaService],
  controllers: [JobController],
  exports: [CryptoService, JobService, PrismaService],
})
export class CommonModule {}


