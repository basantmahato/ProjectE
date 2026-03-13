import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubtopicDto {
  @ApiProperty({ description: 'Subtopic name', example: 'Hooks' })
  name: string;

  @ApiPropertyOptional({ description: 'Subtopic explanation/content' })
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index', example: 0 })
  orderIndex?: number;
}
