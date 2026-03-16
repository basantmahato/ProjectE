import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateSamplePaperSubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Physics' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Name is required' })
  name: string;
}
