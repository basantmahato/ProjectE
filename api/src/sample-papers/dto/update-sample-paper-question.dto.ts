import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSamplePaperQuestionDto {
  @ApiPropertyOptional({ description: 'Question text' })
  @IsOptional()
  @IsString()
  questionText?: string;

  @ApiPropertyOptional({ description: 'Explanation or answer description' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index within topic' })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
