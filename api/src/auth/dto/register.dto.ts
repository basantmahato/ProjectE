import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ description: "Email", example: "m@example.com" })
  email: string;

  @ApiProperty({ description: "Password", example: "string123" })
  password: string;

  @ApiProperty({ description: "Name (optional)", example: "John Doe", required: false })
  name?: string;

  @ApiProperty({ description: "Role", example: "user", required: false })
  role?: "user";
}