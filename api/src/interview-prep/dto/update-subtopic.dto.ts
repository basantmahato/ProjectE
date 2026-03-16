import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSubtopicDto {
  @ApiPropertyOptional({ description: 'Subtopic name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Subtopic explanation/content' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index' })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
