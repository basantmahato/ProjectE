import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateJobRoleDto {
  @ApiPropertyOptional({ description: 'Job role name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Job role description' })
  description?: string;
}
