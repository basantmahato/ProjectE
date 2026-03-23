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

export class CreateMockTestDto {
  @ApiProperty({
    description: 'Mock test title',
    example: 'Python Basics Mock',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Title is required' })
  title: string;

  @ApiPropertyOptional({ description: 'Mock test description' })
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
    description: 'Whether mock test is published',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
