import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateInterviewPrepTopicDto {
  @ApiProperty({ description: 'Topic name', example: 'React' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @ApiPropertyOptional({ description: 'Topic explanation/content' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index', example: 0 })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
