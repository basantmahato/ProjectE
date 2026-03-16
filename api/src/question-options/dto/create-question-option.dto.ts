import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, IsNotEmpty, MinLength } from 'class-validator';

export class CreateQuestionOptionDto {
  @ApiProperty({ description: 'Question ID (from question bank)', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'Option text', example: '4' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Option text is required' })
  optionText: string;

  @ApiPropertyOptional({ description: 'Whether this option is correct', example: true })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
