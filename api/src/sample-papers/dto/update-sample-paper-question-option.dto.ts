import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSamplePaperQuestionOptionDto {
  @ApiPropertyOptional({ description: 'Option text' })
  @IsOptional()
  @IsString()
  optionText?: string;

  @ApiPropertyOptional({ description: 'Whether this option is correct' })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
