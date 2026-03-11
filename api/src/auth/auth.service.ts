import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { db } from "../database/db";
import { users } from "../database/schema/user.schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

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
      const user = await db
        .insert(users)
        .values({
          email: data.email,
          password: hashed,
          name: data.name,
          role: "user",
        })
        .returning();
      return {
        message: "User registered successfully",
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
}