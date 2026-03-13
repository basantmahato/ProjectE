import { ApiProperty } from '@nestjs/swagger';

export class CreateSamplePaperTopicDto {
  @ApiProperty({ description: 'Topic name', example: 'Mechanics' })
  name: string;
}
