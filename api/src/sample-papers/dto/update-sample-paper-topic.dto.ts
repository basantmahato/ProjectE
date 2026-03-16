import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSamplePaperTopicDto {
  @ApiPropertyOptional({ description: 'Topic name' })
  @IsOptional()
  @IsString()
  name?: string;
}
