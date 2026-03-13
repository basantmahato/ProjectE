import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSamplePaperQuestionOptionDto {
  @ApiPropertyOptional({ description: 'Option text' })
  optionText?: string;

  @ApiPropertyOptional({ description: 'Whether this option is correct' })
  isCorrect?: boolean;
}
