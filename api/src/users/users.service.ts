import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../database/db';
import { users } from '../database/schema/user.schema';
import { desc, eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  async findAll() {
    const list = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        plan: users.plan,
        totalMarks: users.totalMarks,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    return list;
  }

  async findOne(id: string) {
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        plan: users.plan,
        totalMarks: users.totalMarks,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id));
    if (!row) throw new NotFoundException('User not found');
    return row;
  }

  async create(dto: CreateUserDto) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));
    if (existing.length > 0) {
      throw new ConflictException('Email already registered');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        email: dto.email,
        password: hashed,
        name: dto.name ?? null,
        role: dto.role ?? 'user',
        plan: dto.plan ?? 'free',
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        plan: users.plan,
        totalMarks: users.totalMarks,
        createdAt: users.createdAt,
      });
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) throw new NotFoundException('User not found');

    if (dto.email !== undefined && dto.email !== existing.email) {
      const byEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, dto.email));
      if (byEmail.length > 0)
        throw new ConflictException('Email already in use');
    }

    const payload: Partial<{
      email: string;
      password: string;
      name: string | null;
      role: 'user' | 'admin';
      plan: 'free' | 'basic' | 'premium';
    }> = {};
    if (dto.email !== undefined) payload.email = dto.email;
    if (dto.name !== undefined) payload.name = dto.name.trim() || null;
    if (dto.role !== undefined) payload.role = dto.role;
    if (dto.plan !== undefined) payload.plan = dto.plan;
    if (dto.password !== undefined)
      payload.password = await bcrypt.hash(dto.password, 10);

    if (Object.keys(payload).length === 0) {
      return this.findOne(id);
    }

    const [updated] = await db
      .update(users)
      .set(payload)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        plan: users.plan,
        totalMarks: users.totalMarks,
        createdAt: users.createdAt,
      });
    return updated;
  }

  async remove(id: string) {
    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) throw new NotFoundException('User not found');
    await db.delete(users).where(eq(users.id, id));
    return { message: 'User deleted' };
  }
}
