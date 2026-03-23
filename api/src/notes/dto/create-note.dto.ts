import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateNoteDto {
  @ApiPropertyOptional({
    description: 'URL-friendly slug (unique). If omitted, derived from title.',
    example: 'introduction-to-kinematics',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Note title',
    example: 'Introduction to Kinematics',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Title is required' })
  title: string;

  @ApiProperty({
    description: 'Note content (text or HTML)',
    example: 'Kinematics is the branch of mechanics...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Order index for display within topic',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
