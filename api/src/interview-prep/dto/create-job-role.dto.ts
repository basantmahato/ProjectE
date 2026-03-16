import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateJobRoleDto {
  @ApiProperty({ description: 'Job role name', example: 'Frontend Developer' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @ApiPropertyOptional({ description: 'Job role description' })
  @IsOptional()
  @IsString()
  description?: string;
}
