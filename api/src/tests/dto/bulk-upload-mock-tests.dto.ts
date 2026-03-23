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

export class BulkUploadMockTestItemDto {
  @ApiProperty({
    description: 'Mock test title',
    example: 'Python Basics Mock',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Mock test description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Duration in minutes', example: 30 })
  @IsNumber()
  durationMinutes: number;

  @ApiProperty({ description: 'Total marks', example: 10 })
  @IsNumber()
  totalMarks: number;

  @ApiPropertyOptional({
    description: 'Whether mock test is published',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Question IDs from question bank to attach to this mock test',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  questionIds?: string[];
}

export class BulkUploadMockTestsDto {
  @ApiProperty({
    description:
      'Array of mock tests to create (each may include questionIds to attach)',
    type: [BulkUploadMockTestItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUploadMockTestItemDto)
  mockTests: BulkUploadMockTestItemDto[];
}
