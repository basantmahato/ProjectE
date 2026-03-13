import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { tests } from '../database/schema/test.schema';
import { and, eq, isNull, lte, or, gte, gt } from 'drizzle-orm';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { CreateMockTestDto } from './dto/create-mock-test.dto';
import { UpdateMockTestDto } from './dto/update-mock-test.dto';

@Injectable()
export class TestsService {
  async create(dto: CreateTestDto) {
    const test = await db
      .insert(tests)
      .values({
        title: dto.title,
        description: dto.description,
        durationMinutes: dto.durationMinutes,
        totalMarks: dto.totalMarks,
        isPublished: dto.isPublished ?? false,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      })
      .returning();

    return test[0];
  }

  async findAll() {
    return db.select().from(tests);
  }

  async findPublished() {
    const now = new Date();
    return db
      .select()
      .from(tests)
      .where(
        and(
          eq(tests.isPublished, true),
          eq(tests.isMock, false),
          or(isNull(tests.scheduledAt), lte(tests.scheduledAt, now)),
          or(isNull(tests.expiresAt), gte(tests.expiresAt, now)),
        ),
      );
  }

  async createMock(dto: CreateMockTestDto) {
    const test = await db
      .insert(tests)
      .values({
        title: dto.title,
        description: dto.description,
        durationMinutes: dto.durationMinutes,
        totalMarks: dto.totalMarks,
        isPublished: dto.isPublished ?? false,
        isMock: true,
        scheduledAt: null,
        expiresAt: null,
      })
      .returning();

    return test[0];
  }

  async findAllMocks() {
    return db
      .select()
      .from(tests)
      .where(eq(tests.isMock, true));
  }

  async findOneMock(id: string) {
    const test = await db
      .select()
      .from(tests)
      .where(and(eq(tests.id, id), eq(tests.isMock, true)));

    if (!test.length) {
      throw new NotFoundException('Mock test not found');
    }

    return test[0];
  }

  async findPublishedMocks() {
    return db
      .select()
      .from(tests)
      .where(and(eq(tests.isMock, true), eq(tests.isPublished, true)));
  }

  async findOnePublishedMock(id: string) {
    const test = await db
      .select()
      .from(tests)
      .where(
        and(eq(tests.id, id), eq(tests.isMock, true), eq(tests.isPublished, true)),
      );

    if (!test.length) {
      throw new NotFoundException('Mock test not found');
    }

    return test[0];
  }

  async updateMock(id: string, dto: UpdateMockTestDto) {
    const existing = await this.findOneMock(id);
    const updated = await db
      .update(tests)
      .set({
        ...(dto.title != null && { title: dto.title }),
        ...(dto.description != null && { description: dto.description }),
        ...(dto.durationMinutes != null && { durationMinutes: dto.durationMinutes }),
        ...(dto.totalMarks != null && { totalMarks: dto.totalMarks }),
        ...(dto.isPublished != null && { isPublished: dto.isPublished }),
      })
      .where(eq(tests.id, id))
      .returning();

    if (!updated.length) {
      throw new NotFoundException('Mock test not found');
    }

    return updated[0];
  }

  async removeMock(id: string) {
    const test = await db
      .select()
      .from(tests)
      .where(and(eq(tests.id, id), eq(tests.isMock, true)));

    if (!test.length) {
      throw new NotFoundException('Mock test not found');
    }

    await db.delete(tests).where(eq(tests.id, id));
    return { message: 'Mock test deleted successfully' };
  }

  async findUpcoming() {
    const now = new Date();
    return db
      .select()
      .from(tests)
      .where(
        and(
          eq(tests.isPublished, true),
          eq(tests.isMock, false),
          gt(tests.scheduledAt, now),
        ),
      );
  }

  async findOnePublished(id: string) {
    const now = new Date();
    const test = await db
      .select()
      .from(tests)
      .where(eq(tests.id, id));

    if (!test.length || !test[0].isPublished) {
      throw new NotFoundException('Test not found');
    }

    const { scheduledAt, expiresAt } = test[0];
    if (scheduledAt && scheduledAt > now) {
      throw new NotFoundException('Test not found');
    }
    if (expiresAt && expiresAt < now) {
      throw new NotFoundException('Test not found');
    }

    return test[0];
  }

  async findOne(id: string) {
    const test = await db
      .select()
      .from(tests)
      .where(eq(tests.id, id));

    if (!test.length) {
      throw new NotFoundException('Test not found');
    }

    return test[0];
  }

  async update(id: string, dto: UpdateTestDto) {
    const updated = await db
      .update(tests)
      .set({
        ...(dto.title != null && { title: dto.title }),
        ...(dto.description != null && { description: dto.description }),
        ...(dto.durationMinutes != null && { durationMinutes: dto.durationMinutes }),
        ...(dto.totalMarks != null && { totalMarks: dto.totalMarks }),
        ...(dto.isPublished != null && { isPublished: dto.isPublished }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null }),
        ...(dto.expiresAt !== undefined && { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null }),
      })
      .where(eq(tests.id, id))
      .returning();

    if (!updated.length) {
      throw new NotFoundException('Test not found');
    }

    return updated[0];
  }

  async remove(id: string) {
    const test = await db
      .delete(tests)
      .where(eq(tests.id, id))
      .returning();

    if (!test.length) {
      throw new NotFoundException('Test not found');
    }

    return { message: 'Test deleted successfully' };
  }
}
