import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateInterviewPrepTopicDto {
  @ApiPropertyOptional({ description: 'Topic name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Topic explanation/content' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index' })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
