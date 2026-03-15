import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GoogleAuthDto {
  @ApiPropertyOptional({
    description: "Google ID token from the client OAuth flow (when using implicit flow)",
    example: "eyJhbGciOiJSUzI1NiIs...",
  })
  @IsOptional()
  @IsString()
  id_token?: string;

  @ApiPropertyOptional({
    description: "Authorization code from the OAuth redirect (when using authorization code flow)",
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: "Redirect URI used in the authorization request (required when code is provided)",
  })
  @IsOptional()
  @IsString()
  redirect_uri?: string;
}
