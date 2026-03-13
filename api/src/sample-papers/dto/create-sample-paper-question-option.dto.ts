import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSamplePaperQuestionOptionDto {
  @ApiProperty({ description: 'Option text', example: 'Newton' })
  optionText: string;

  @ApiPropertyOptional({ description: 'Whether this option is correct', example: true })
  isCorrect?: boolean;
}
