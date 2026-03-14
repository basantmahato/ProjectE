import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SamplePapersController } from './sample-papers.controller';
import { SamplePapersPublicController } from './sample-papers-public.controller';
import { SamplePapersService } from './sample-papers.service';

@Module({
  imports: [AuthModule],
  controllers: [SamplePapersPublicController, SamplePapersController],
  providers: [SamplePapersService],
  exports: [SamplePapersService],
})
export class SamplePapersModule {}
