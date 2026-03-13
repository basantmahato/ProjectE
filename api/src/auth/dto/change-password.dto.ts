import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ description: "Current password", example: "currentPassword123" })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: "New password (min 6 characters)", example: "newPassword123" })
  @IsString()
  @MinLength(6, { message: "New password must be at least 6 characters" })
  newPassword: string;
}
