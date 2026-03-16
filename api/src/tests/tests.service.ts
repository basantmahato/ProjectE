import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { tests } from '../database/schema/test.schema';
import { testQuestions } from '../database/schema/testQuestions.schema';
import { and, eq, isNull, lte, or, gte, gt, sql } from 'drizzle-orm';
import { slugify, ensureUniqueSlug } from '../common/slug.util';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { CreateMockTestDto } from './dto/create-mock-test.dto';
import { UpdateMockTestDto } from './dto/update-mock-test.dto';
import { BulkUploadTestsDto } from './dto/bulk-upload-tests.dto';
import { BulkUploadMockTestsDto } from './dto/bulk-upload-mock-tests.dto';
import { TestQuestionsService } from './test-questions.service';

@Injectable()
export class TestsService {
  constructor(private readonly testQuestionsService: TestQuestionsService) {}

  async create(dto: CreateTestDto) {
    const slug = await ensureUniqueSlug(slugify(dto.title), async (s) => {
      const [existing] = await db.select().from(tests).where(eq(tests.slug, s));
      return !!existing;
    });
    const test = await db
      .insert(tests)
      .values({
        slug,
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

  async findAll(page = 1, limit = 20) {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(50, Math.max(1, limit));
    const offset = (pageNum - 1) * limitNum;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tests);
    const total = countResult?.count ?? 0;

    const data = await db.select().from(tests).limit(limitNum).offset(offset);
    return { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 };
  }

  async findPublished(page = 1, limit = 20) {
    const now = new Date();
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(50, Math.max(1, limit));
    const offset = (pageNum - 1) * limitNum;
    const condition = and(
      eq(tests.isPublished, true),
      eq(tests.isMock, false),
      or(isNull(tests.scheduledAt), lte(tests.scheduledAt, now)),
      or(isNull(tests.expiresAt), gte(tests.expiresAt, now)),
    );

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tests)
      .where(condition);
    const total = countResult?.count ?? 0;

    const data = await db
      .select()
      .from(tests)
      .where(condition)
      .limit(limitNum)
      .offset(offset);
    return { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 };
  }

  async createMock(dto: CreateMockTestDto) {
    const slug = await ensureUniqueSlug(slugify(dto.title), async (s) => {
      const [existing] = await db.select().from(tests).where(eq(tests.slug, s));
      return !!existing;
    });
    const test = await db
      .insert(tests)
      .values({
        slug,
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

  async findAllMocks(page = 1, limit = 20) {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(50, Math.max(1, limit));
    const offset = (pageNum - 1) * limitNum;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tests)
      .where(eq(tests.isMock, true));
    const total = countResult?.count ?? 0;

    const data = await db
      .select()
      .from(tests)
      .where(eq(tests.isMock, true))
      .limit(limitNum)
      .offset(offset);
    return { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 };
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

  async findOnePublishedBySlug(slug: string) {
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.slug, slug));

    if (!test || !test.isPublished || test.isMock) {
      throw new NotFoundException('Test not found');
    }
    const now = new Date();
    if (test.scheduledAt && test.scheduledAt > now) {
      throw new NotFoundException('Test not found');
    }
    if (test.expiresAt && test.expiresAt < now) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  async findOnePublishedMockBySlug(slug: string) {
    const [test] = await db
      .select()
      .from(tests)
      .where(
        and(eq(tests.slug, slug), eq(tests.isMock, true), eq(tests.isPublished, true)),
      );
    if (!test) throw new NotFoundException('Mock test not found');
    return test;
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

  async bulkCreate(dto: BulkUploadTestsDto) {
    const created = { count: 0 };
    const errors: { index: number; message: string }[] = [];

    await db.transaction(async (tx) => {
      for (let i = 0; i < dto.tests.length; i++) {
        try {
          const item = dto.tests[i];
          const slug = await ensureUniqueSlug(slugify(item.title), async (s) => {
            const [existing] = await tx.select().from(tests).where(eq(tests.slug, s));
            return !!existing;
          });
          await tx.insert(tests).values({
            slug,
            title: item.title,
            description: item.description,
            durationMinutes: item.durationMinutes,
            totalMarks: item.totalMarks,
            isPublished: item.isPublished ?? false,
            scheduledAt: item.scheduledAt ? new Date(item.scheduledAt) : null,
            expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
          });
          created.count += 1;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push({ index: i, message });
        }
      }
    });

    return { created, errors: errors.length ? errors : undefined };
  }

  async bulkCreateMocks(dto: BulkUploadMockTestsDto) {
    const created = { count: 0 };
    const errors: { index: number; message: string }[] = [];

    await db.transaction(async (tx) => {
      for (let i = 0; i < dto.mockTests.length; i++) {
        const item = dto.mockTests[i];
        try {
          const slug = await ensureUniqueSlug(slugify(item.title), async (s) => {
            const [existing] = await tx.select().from(tests).where(eq(tests.slug, s));
            return !!existing;
          });
          const [mock] = await tx
            .insert(tests)
            .values({
              slug,
              title: item.title,
              description: item.description,
              durationMinutes: item.durationMinutes,
              totalMarks: item.totalMarks,
              isPublished: item.isPublished ?? false,
              isMock: true,
              scheduledAt: null,
              expiresAt: null,
            })
            .returning();
          created.count += 1;

          if (item.questionIds?.length) {
            for (let order = 0; order < item.questionIds.length; order++) {
              await tx.insert(testQuestions).values({
                testId: mock.id,
                questionId: item.questionIds[order],
                questionOrder: order,
              });
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push({ index: i, message });
        }
      }
    });

    return { created, errors: errors.length ? errors : undefined };
  }
}
