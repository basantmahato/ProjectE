import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @ApiProperty({ description: 'Exam type', example: 'JEE', required: false })
  @IsOptional()
  @IsString()
  examType?: string;
}
