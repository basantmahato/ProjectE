import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
  Min,
} from 'class-validator';

export class CreateTestDto {
  @ApiProperty({ description: 'Test title', example: 'Python Basics Quiz' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Title is required' })
  title: string;

  @ApiPropertyOptional({
    description: 'Test description',
    example: 'Covers variables and data types',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Duration in minutes', example: 30 })
  @IsNumber()
  @Min(1, { message: 'Duration must be at least 1 minute' })
  durationMinutes: number;

  @ApiProperty({ description: 'Total marks', example: 10 })
  @IsNumber()
  @Min(0, { message: 'Total marks must be 0 or more' })
  totalMarks: number;

  @ApiPropertyOptional({
    description: 'Whether test is published',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'When the test becomes available (ISO 8601)',
    example: '2026-03-20T09:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'When the test stops being available (ISO 8601)',
    example: '2026-03-20T11:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
