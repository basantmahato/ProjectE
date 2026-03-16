import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateReplyDto {
  @ApiProperty({ description: 'Reply content' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Content is required' })
  content: string;
}
