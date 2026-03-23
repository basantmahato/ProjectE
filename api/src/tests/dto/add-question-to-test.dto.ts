import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class AddQuestionToTestDto {
  @ApiProperty({
    description: 'Question ID from question bank',
    example: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiPropertyOptional({ description: 'Order of question in test', example: 1 })
  @IsOptional()
  @IsNumber()
  questionOrder?: number;
}
