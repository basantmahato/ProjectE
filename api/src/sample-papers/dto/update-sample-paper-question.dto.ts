import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSamplePaperQuestionDto {
  @ApiPropertyOptional({ description: 'Question text' })
  questionText?: string;

  @ApiPropertyOptional({ description: 'Explanation or answer description' })
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index within topic' })
  orderIndex?: number;
}
