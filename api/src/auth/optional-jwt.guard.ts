import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      (request as any).user = null;
      return true;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      (request as any).user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      (request as any).user = null;
    }
    return true;
  }
}
