import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobRoleDto {
  @ApiProperty({ description: 'Job role name', example: 'Frontend Developer' })
  name: string;

  @ApiPropertyOptional({ description: 'Job role description' })
  description?: string;
}
