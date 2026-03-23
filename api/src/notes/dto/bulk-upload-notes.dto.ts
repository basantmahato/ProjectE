import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUploadNoteItemDto {
  @ApiPropertyOptional({
    description: 'URL-friendly slug (unique). If omitted, derived from title.',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Note title',
    example: 'Introduction to Kinematics',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Note content (text or HTML)',
    example: 'Kinematics is the branch of mechanics...',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Order index for display within topic',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}

export class BulkUploadNotesDto {
  @ApiProperty({
    description: 'Topic ID to attach all notes to',
    example: 'uuid',
  })
  @IsUUID()
  topicId: string;

  @ApiProperty({
    description: 'Array of notes to create',
    type: [BulkUploadNoteItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUploadNoteItemDto)
  notes: BulkUploadNoteItemDto[];
}
