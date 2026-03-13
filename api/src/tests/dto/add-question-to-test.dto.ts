import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddQuestionToTestDto {
  @ApiProperty({ description: 'Question ID from question bank', example: 'uuid' })
  questionId: string;

  @ApiPropertyOptional({ description: 'Order of question in test', example: 1 })
  questionOrder?: number;
}
