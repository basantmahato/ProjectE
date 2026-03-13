import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSamplePaperQuestionDto {
  @ApiProperty({ description: 'Question text', example: 'What is the unit of force?' })
  questionText: string;

  @ApiPropertyOptional({ description: 'Explanation or answer description' })
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index within topic', example: 0 })
  orderIndex?: number;
}
