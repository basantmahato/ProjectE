import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateQuestionBankDto {
  @ApiProperty({ description: 'Topic ID', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  topicId: string;

  @ApiProperty({ description: 'Question text', example: 'What is 2 + 2?' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Question text is required' })
  questionText: string;

  @ApiPropertyOptional({
    description: 'Difficulty',
    example: 'easy',
    enum: ['easy', 'medium', 'hard'],
  })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Marks', example: 1 })
  @IsOptional()
  @IsNumber()
  marks?: number;

  @ApiPropertyOptional({ description: 'Negative marks', example: 0 })
  @IsOptional()
  @IsNumber()
  negativeMarks?: number;

  @ApiPropertyOptional({
    description: 'Explanation',
    example: 'Basic addition',
  })
  @IsOptional()
  @IsString()
  explanation?: string;
}
