import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { db } from '../database/db';
import { users } from '../database/schema/user.schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(data: RegisterDto) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (existing.length > 0) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(data.password, 10);

    try {
      const [user] = await db
        .insert(users)
        .values({
          email: data.email,
          password: hashed,
          name: data.name ?? null,
          role: 'user',
        })
        .returning();
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const { password: _, ...userWithoutPassword } = user;
      return {
        message: 'User registered successfully',
        user: userWithoutPassword,
        access_token: this.jwtService.sign(payload),
      };
    } catch (err: unknown) {
      const isUniqueViolation =
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === '23505';
      if (isUniqueViolation) {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }
  }

  async validateUser(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) throw new UnauthorizedException();
    if (!user.password)
      throw new UnauthorizedException('Use Google sign-in for this account');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException();
    return user;
  }

  async login(data: LoginDto) {
    const user = await this.validateUser(data.email, data.password);
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const { password: _, ...userWithoutPassword } = user;
    return {
      message: 'Login successful',
      user: userWithoutPassword,
      access_token: this.jwtService.sign(payload),
    };
  }

  private async exchangeGoogleCodeForIdToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Google OAuth not configured');
    }
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new UnauthorizedException(
        'Failed to exchange Google code: ' + text,
      );
    }
    const data = (await res.json()) as { id_token?: string };
    if (!data.id_token) {
      throw new UnauthorizedException('No id_token in Google token response');
    }
    return data.id_token;
  }

  async loginWithGoogle(dto: {
    id_token?: string;
    code?: string;
    redirect_uri?: string;
  }) {
    let idToken: string;
    if (dto.id_token) {
      idToken = dto.id_token;
    } else if (dto.code && dto.redirect_uri) {
      idToken = await this.exchangeGoogleCodeForIdToken(
        dto.code,
        dto.redirect_uri,
      );
    } else {
      throw new UnauthorizedException(
        'Provide id_token or code with redirect_uri',
      );
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      throw new UnauthorizedException('Invalid Google ID token');
    }
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) {
      throw new UnauthorizedException('Invalid Google token payload');
    }
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name ?? payload.given_name ?? null;

    const existingByGoogleId = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId));
    if (existingByGoogleId.length > 0) {
      const user = existingByGoogleId[0];
      const jwtPayload = { sub: user.id, email: user.email, role: user.role };
      const { password: _, ...userWithoutPassword } = user;
      return {
        message: 'Login successful',
        user: userWithoutPassword,
        access_token: this.jwtService.sign(jwtPayload),
      };
    }

    const existingByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingByEmail.length > 0) {
      const user = existingByEmail[0];
      await db.update(users).set({ googleId }).where(eq(users.id, user.id));
      const updated = { ...user, googleId };
      const jwtPayload = {
        sub: updated.id,
        email: updated.email,
        role: updated.role,
      };
      const { password: _, ...userWithoutPassword } = updated;
      return {
        message: 'Login successful',
        user: userWithoutPassword,
        access_token: this.jwtService.sign(jwtPayload),
      };
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        googleId,
        password: null,
        role: 'user',
      })
      .returning();
    const jwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };
    const { password: _, ...userWithoutPassword } = newUser;
    return {
      message: 'User registered successfully',
      user: userWithoutPassword,
      access_token: this.jwtService.sign(jwtPayload),
    };
  }

  async getMe(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        plan: users.plan,
      })
      .from(users)
      .where(eq(users.id, userId));
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updatePayload: Partial<{ name: string | null; email: string }> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name.trim() || null;
    if (dto.email !== undefined) updatePayload.email = dto.email.trim();

    if (Object.keys(updatePayload).length === 0) {
      const [current] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      if (!current) throw new NotFoundException('User not found');
      const { password: _, ...userWithoutPassword } = current;
      return { user: userWithoutPassword };
    }

    if (updatePayload.email !== undefined) {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, updatePayload.email));
      if (existing.length > 0 && existing[0].id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const [updated] = await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, userId))
      .returning();

    if (!updated) throw new NotFoundException('User not found');
    const { password: _, ...userWithoutPassword } = updated;
    return { user: userWithoutPassword };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new NotFoundException('User not found');

    if (user.password) {
      if (!dto.currentPassword) {
        throw new UnauthorizedException('Current password is required');
      }
      const match = await bcrypt.compare(dto.currentPassword, user.password);
      if (!match)
        throw new UnauthorizedException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await db
      .update(users)
      .set({ password: hashed })
      .where(eq(users.id, userId));
    return { message: 'Password updated' };
  }
}
