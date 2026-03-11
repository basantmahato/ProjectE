import { ApiProperty } from "@nestjs/swagger";
export class RegisterDto {
    @ApiProperty({ description: "Email", example: "test@example.com" })
    email: string;
    @ApiProperty({ description: "Password", example: "password" })
    password: string;
    @ApiProperty({ description: "Name", example: "John Doe" })
    name: string;
    @ApiProperty({ description: "Role", example: "user" })
    role?: "user" ;
  }