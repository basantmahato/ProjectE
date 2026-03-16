import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, MinLength } from 'class-validator';

export class CreateTopicDto {
  @ApiProperty({ description: 'Subject ID', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'Topic name', example: 'Algebra' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Name is required' })
  name: string;
}
