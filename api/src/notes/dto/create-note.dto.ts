import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiPropertyOptional({ description: 'URL-friendly slug (unique). If omitted, derived from title.', example: 'introduction-to-kinematics' })
  slug?: string;

  @ApiProperty({ description: 'Note title', example: 'Introduction to Kinematics' })
  title: string;

  @ApiProperty({ description: 'Note content (text or HTML)', example: 'Kinematics is the branch of mechanics...' })
  content: string;

  @ApiPropertyOptional({ description: 'Order index for display within topic', example: 0 })
  orderIndex?: number;
}
