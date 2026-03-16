import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSamplePaperSubjectDto {
  @ApiPropertyOptional({ description: 'Subject name' })
  @IsOptional()
  @IsString()
  name?: string;
}
