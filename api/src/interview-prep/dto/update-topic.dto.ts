import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTopicDto {
  @ApiPropertyOptional({ description: 'Topic name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Topic explanation/content' })
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index' })
  orderIndex?: number;
}
