import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkSamplePaperOptionDto {
  @ApiProperty({ description: 'Option text', example: 'Newton' })
  @IsString()
  optionText: string;

  @ApiPropertyOptional({ description: 'Whether this option is correct', example: true })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}

export class BulkSamplePaperQuestionDto {
  @ApiProperty({ description: 'Question text', example: 'What is the unit of force?' })
  @IsString()
  questionText: string;

  @ApiPropertyOptional({ description: 'Explanation or answer description' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index within topic', example: 0 })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;

  @ApiPropertyOptional({ type: [BulkSamplePaperOptionDto], description: 'Answer options' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSamplePaperOptionDto)
  options?: BulkSamplePaperOptionDto[];
}

export class BulkSamplePaperTopicDto {
  @ApiProperty({ description: 'Topic name', example: 'Physics' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: [BulkSamplePaperQuestionDto], description: 'Questions under this topic' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSamplePaperQuestionDto)
  questions?: BulkSamplePaperQuestionDto[];
}

export class BulkSamplePaperSubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Science' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: [BulkSamplePaperTopicDto], description: 'Topics under this subject' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSamplePaperTopicDto)
  topics?: BulkSamplePaperTopicDto[];
}

export class BulkSamplePaperItemDto {
  @ApiPropertyOptional({ description: 'URL-friendly slug (unique). If omitted, derived from title.' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Sample paper title', example: 'JEE Main 2025 Sample' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Sample paper description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [BulkSamplePaperSubjectDto], description: 'Subjects with topics and questions' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSamplePaperSubjectDto)
  subjects: BulkSamplePaperSubjectDto[];
}

export class BulkUploadSamplePapersDto {
  @ApiProperty({
    description: 'Array of sample papers to create (each with subjects → topics → questions → options)',
    type: [BulkSamplePaperItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSamplePaperItemDto)
  papers: BulkSamplePaperItemDto[];
}
