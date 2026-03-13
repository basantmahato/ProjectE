import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateProfileDto {
  @ApiProperty({ description: "Name", example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Name must not be empty" })
  name?: string;

  @ApiProperty({ description: "Email", example: "user@example.com", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}
