import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
  name: string;

  @ApiProperty({ description: 'Exam type', example: 'JEE' })
  examType: string;
}
