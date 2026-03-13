import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMockTestDto {
  @ApiProperty({ description: 'Mock test title', example: 'Python Basics Mock' })
  title: string;

  @ApiPropertyOptional({ description: 'Mock test description' })
  description?: string;

  @ApiProperty({ description: 'Duration in minutes', example: 30 })
  durationMinutes: number;

  @ApiProperty({ description: 'Total marks', example: 10 })
  totalMarks: number;

  @ApiPropertyOptional({ description: 'Whether mock test is published', example: false })
  isPublished?: boolean;
}
