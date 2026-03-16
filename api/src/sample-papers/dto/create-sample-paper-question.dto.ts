import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateSamplePaperQuestionDto {
  @ApiProperty({ description: 'Question text', example: 'What is the unit of force?' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Question text is required' })
  questionText: string;

  @ApiPropertyOptional({ description: 'Explanation or answer description' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index within topic', example: 0 })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
