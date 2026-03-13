import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestDto {
  @ApiProperty({ description: 'Test title', example: 'Python Basics Quiz' })
  title: string;

  @ApiPropertyOptional({ description: 'Test description', example: 'Covers variables and data types' })
  description?: string;

  @ApiProperty({ description: 'Duration in minutes', example: 30 })
  durationMinutes: number;

  @ApiProperty({ description: 'Total marks', example: 10 })
  totalMarks: number;

  @ApiPropertyOptional({ description: 'Whether test is published', example: false })
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'When the test becomes available (ISO 8601)', example: '2026-03-20T09:00:00.000Z' })
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'When the test stops being available (ISO 8601)', example: '2026-03-20T11:00:00.000Z' })
  expiresAt?: string;
}
