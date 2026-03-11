import { Module } from '@nestjs/common';
import { DashbaordService } from './dashbaord.service';
import { DashbaordController } from './dashbaord.controller';

@Module({
  controllers: [DashbaordController],
  providers: [DashbaordService],
})
export class DashbaordModule {}
