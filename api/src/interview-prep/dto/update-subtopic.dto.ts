import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubtopicDto {
  @ApiPropertyOptional({ description: 'Subtopic name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Subtopic explanation/content' })
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index' })
  orderIndex?: number;
}
