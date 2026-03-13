import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { db } from "../database/db";
import { users } from "../database/schema/user.schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class AuthService {

  constructor(private jwtService: JwtService) {}

  async register(data) {
    const existing = await db.select().from(users).where(eq(users.email, data.email));
  
    if (existing.length > 0) {
      throw new ConflictException("Email already registered");
    }
  
    const hashed = await bcrypt.hash(data.password, 10);
  
    try {
      const [user] = await db
        .insert(users)
        .values({
          email: data.email,
          password: hashed,
          name: data.name ?? null,
          role: "user",
        })
        .returning();
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const { password: _, ...userWithoutPassword } = user;
      return {
        message: "User registered successfully",
        user: userWithoutPassword,
        access_token: this.jwtService.sign(payload),
      };
    } catch (err: unknown) {
      const isUniqueViolation =
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === "23505";
      if (isUniqueViolation) {
        throw new ConflictException("Email already registered");
      }
      throw err;
    }
  }

  async validateUser(email: string, password: string) {

    const user = await db.select().from(users).where(eq(users.email, email));

    if (!user) throw new UnauthorizedException();

    const match = await bcrypt.compare(password, user[0].password);

    if (!match) throw new UnauthorizedException();

    return user[0];
  }

  async login(data) {

    const user = await this.validateUser(data.email, data.password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: "Login successful",
      user: userWithoutPassword,
      access_token: this.jwtService.sign(payload)
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updatePayload: Partial<{ name: string | null; email: string }> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name.trim() || null;
    if (dto.email !== undefined) updatePayload.email = dto.email.trim();

    if (Object.keys(updatePayload).length === 0) {
      const [current] = await db.select().from(users).where(eq(users.id, userId));
      if (!current) throw new NotFoundException("User not found");
      const { password: _, ...userWithoutPassword } = current;
      return { user: userWithoutPassword };
    }

    if (updatePayload.email !== undefined) {
      const existing = await db.select().from(users).where(eq(users.email, updatePayload.email));
      if (existing.length > 0 && existing[0].id !== userId) {
        throw new ConflictException("Email already in use");
      }
    }

    const [updated] = await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, userId))
      .returning();

    if (!updated) throw new NotFoundException("User not found");
    const { password: _, ...userWithoutPassword } = updated;
    return { user: userWithoutPassword };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new NotFoundException("User not found");

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match) throw new UnauthorizedException("Current password is incorrect");

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await db.update(users).set({ password: hashed }).where(eq(users.id, userId));
    return { message: "Password updated" };
  }
}