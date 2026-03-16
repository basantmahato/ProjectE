import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { OptionalJwtGuard } from "./optional-jwt.guard";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: "7d" },
      }),
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, OptionalJwtGuard],
  controllers: [AuthController],
  exports: [JwtModule, JwtAuthGuard, RolesGuard, OptionalJwtGuard],
})
export class AuthModule {}