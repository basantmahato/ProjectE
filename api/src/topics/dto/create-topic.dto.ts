import { ApiProperty } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({ description: 'Subject ID', example: 'uuid' })
  subjectId: string;

  @ApiProperty({ description: 'Topic name', example: 'Algebra' })
  name: string;
}
