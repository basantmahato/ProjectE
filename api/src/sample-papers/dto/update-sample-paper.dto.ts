import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSamplePaperDto {
  @ApiPropertyOptional({ description: 'URL-friendly slug (unique)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Sample paper title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Sample paper description' })
  @IsOptional()
  @IsString()
  description?: string;
}
