import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUploadSubtopicItemDto {
  @ApiProperty({ description: 'Subtopic name', example: 'Hooks' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Subtopic explanation/content' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index', example: 0 })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}

export class BulkUploadTopicItemDto {
  @ApiProperty({ description: 'Topic name', example: 'React' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Topic explanation/content' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Order index', example: 0 })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;

  @ApiPropertyOptional({
    type: [BulkUploadSubtopicItemDto],
    description: 'Subtopics under this topic',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUploadSubtopicItemDto)
  subtopics?: BulkUploadSubtopicItemDto[];
}

export class BulkUploadJobRoleItemDto {
  @ApiProperty({ description: 'Job role name', example: 'Frontend Developer' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Job role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [BulkUploadTopicItemDto],
    description: 'Topics under this job role',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUploadTopicItemDto)
  topics?: BulkUploadTopicItemDto[];
}

export class BulkUploadInterviewPrepDto {
  @ApiProperty({
    description:
      'Array of job roles to create (each with optional topics and subtopics)',
    type: [BulkUploadJobRoleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUploadJobRoleItemDto)
  jobRoles: BulkUploadJobRoleItemDto[];
}
