import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSamplePaperDto {
  @ApiPropertyOptional({ description: 'URL-friendly slug (unique). If omitted, derived from title.', example: 'jee-main-2025-sample' })
  slug?: string;

  @ApiProperty({ description: 'Sample paper title', example: 'JEE Main 2025 Sample' })
  title: string;

  @ApiPropertyOptional({ description: 'Sample paper description' })
  description?: string;
}
