import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSamplePaperDto {
  @ApiPropertyOptional({ description: 'URL-friendly slug (unique)' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Sample paper title' })
  title?: string;

  @ApiPropertyOptional({ description: 'Sample paper description' })
  description?: string;
}
