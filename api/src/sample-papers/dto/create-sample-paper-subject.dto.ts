import { ApiProperty } from '@nestjs/swagger';

export class CreateSamplePaperSubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Physics' })
  name: string;
}
