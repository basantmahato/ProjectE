import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class StartAttemptDto {
  @ApiProperty({ description: 'Test ID to attempt', example: 'uuid' })
  @IsUUID('4', { message: 'testId must be a valid UUID' })
  @IsString()
  testId: string;
}
