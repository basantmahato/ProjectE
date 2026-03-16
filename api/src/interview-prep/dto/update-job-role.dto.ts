import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateJobRoleDto {
  @ApiPropertyOptional({ description: 'Job role name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Job role description' })
  @IsOptional()
  @IsString()
  description?: string;
}
