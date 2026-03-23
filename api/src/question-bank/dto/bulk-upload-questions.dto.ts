import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUploadOptionDto {
  @ApiProperty({ description: 'Option text', example: '4' })
  @IsString()
  optionText: string;

  @ApiPropertyOptional({
    description: 'Whether this option is correct',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}

export class BulkUploadQuestionDto {
  @ApiProperty({ description: 'Question text', example: 'What is 2 + 2?' })
  @IsString()
  questionText: string;

  @ApiPropertyOptional({
    description: 'Difficulty',
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

  @ApiPropertyOptional({ description: 'Explanation' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({
    description: 'Options for this question',
    type: [BulkUploadOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUploadOptionDto)
  options?: BulkUploadOptionDto[];
}

export class BulkUploadQuestionsDto {
  @ApiProperty({
    description: 'Topic ID to attach all questions to',
    example: 'uuid',
  })
  @IsUUID()
  topicId: string;

  @ApiProperty({
    description: 'Array of questions with optional options',
    type: [BulkUploadQuestionDto],
    example: [
      {
        questionText: 'What is 2 + 2?',
        difficulty: 'easy',
        marks: 1,
        options: [
          { optionText: '3', isCorrect: false },
          { optionText: '4', isCorrect: true },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUploadQuestionDto)
  questions: BulkUploadQuestionDto[];
}
