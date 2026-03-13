import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { tests } from '../database/schema/test.schema';
import { eq } from 'drizzle-orm';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

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
      })
      .returning();

    return test[0];
  }

  async findAll() {
    return db.select().from(tests);
  }

  async findPublished() {
    return db
      .select()
      .from(tests)
      .where(eq(tests.isPublished, true));
  }

  async findOnePublished(id: string) {
    const test = await db
      .select()
      .from(tests)
      .where(eq(tests.id, id));

    if (!test.length || !test[0].isPublished) {
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
