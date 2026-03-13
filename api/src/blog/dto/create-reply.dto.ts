import { ApiProperty } from '@nestjs/swagger';

export class CreateReplyDto {
  @ApiProperty({ description: 'Reply content' })
  content: string;
}
