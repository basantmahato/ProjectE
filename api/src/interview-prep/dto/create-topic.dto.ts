import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({ description: 'Topic name', example: 'React' })
  name: string;

  @ApiPropertyOptional({ description: 'Topic explanation/content' })
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index', example: 0 })
  orderIndex?: number;
}
