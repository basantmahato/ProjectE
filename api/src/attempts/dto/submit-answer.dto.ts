import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'Question ID from question bank', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiPropertyOptional({ description: 'Selected option ID (null if skipped)', example: 'uuid' })
  @IsOptional()
  @IsString()
  selectedOptionId?: string | null;
}
