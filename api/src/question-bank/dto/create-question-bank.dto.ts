import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionBankDto {
  @ApiProperty({ description: 'Topic ID', example: 'uuid' })
  topicId: string;

  @ApiProperty({ description: 'Question text', example: 'What is 2 + 2?' })
  questionText: string;

  @ApiPropertyOptional({ description: 'Difficulty', example: 'easy', enum: ['easy', 'medium', 'hard'] })
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Marks', example: 1 })
  marks?: number;

  @ApiPropertyOptional({ description: 'Negative marks', example: 0 })
  negativeMarks?: number;

  @ApiPropertyOptional({ description: 'Explanation', example: 'Basic addition' })
  explanation?: string;
}
