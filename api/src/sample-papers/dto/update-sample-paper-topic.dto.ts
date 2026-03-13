import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSamplePaperTopicDto {
  @ApiPropertyOptional({ description: 'Topic name' })
  name?: string;
}
