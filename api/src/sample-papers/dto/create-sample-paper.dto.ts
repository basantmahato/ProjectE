import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSamplePaperDto {
  @ApiProperty({ description: 'Sample paper title', example: 'JEE Main 2025 Sample' })
  title: string;

  @ApiPropertyOptional({ description: 'Sample paper description' })
  description?: string;
}
