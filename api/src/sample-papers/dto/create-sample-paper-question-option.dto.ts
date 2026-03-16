import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateSamplePaperQuestionOptionDto {
  @ApiProperty({ description: 'Option text', example: 'Newton' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Option text is required' })
  optionText: string;

  @ApiPropertyOptional({ description: 'Whether this option is correct', example: true })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
