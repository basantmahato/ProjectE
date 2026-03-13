import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionOptionDto {
  @ApiProperty({ description: 'Question ID (from question bank)', example: 'uuid' })
  questionId: string;

  @ApiProperty({ description: 'Option text', example: '4' })
  optionText: string;

  @ApiPropertyOptional({ description: 'Whether this option is correct', example: true })
  isCorrect?: boolean;
}
