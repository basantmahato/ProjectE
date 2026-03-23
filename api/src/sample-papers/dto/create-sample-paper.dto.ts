import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateSamplePaperDto {
  @ApiPropertyOptional({
    description: 'URL-friendly slug (unique). If omitted, derived from title.',
    example: 'jee-main-2025-sample',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Sample paper title',
    example: 'JEE Main 2025 Sample',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Title is required' })
  title: string;

  @ApiPropertyOptional({ description: 'Sample paper description' })
  @IsOptional()
  @IsString()
  description?: string;
}
