import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'Question ID from question bank', example: 'uuid' })
  questionId: string;

  @ApiPropertyOptional({ description: 'Selected option ID (null if skipped)', example: 'uuid' })
  selectedOptionId?: string | null;
}
