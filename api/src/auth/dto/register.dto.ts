import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ description: "Email", example: "m@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Password", example: "string123" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;

  @ApiProperty({ description: "Name (optional)", example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "Role", example: "user", required: false })
  @IsOptional()
  @IsIn(["user"])
  role?: "user";
}