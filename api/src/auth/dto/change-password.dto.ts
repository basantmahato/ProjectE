import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiPropertyOptional({ description: "Current password (optional for Google users)", example: "currentPassword123" })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({ description: "New password (min 6 characters)", example: "newPassword123" })
  @IsString()
  @MinLength(6, { message: "New password must be at least 6 characters" })
  newPassword: string;
}
