import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSamplePaperSubjectDto {
  @ApiPropertyOptional({ description: 'Subject name' })
  name?: string;
}
