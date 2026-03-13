import { ApiProperty } from '@nestjs/swagger';

export class StartAttemptDto {
  @ApiProperty({ description: 'Test ID to attempt', example: 'uuid' })
  testId: string;
}
