import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { subjects } from '../database/schema/subjects.schema';
import { eq } from 'drizzle-orm';
import { slugify, ensureUniqueSlug } from '../common/slug.util';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  async create(dto: CreateSubjectDto) {
    const slug = await ensureUniqueSlug(slugify(dto.name), async (s) => {
      const [existing] = await db
        .select()
        .from(subjects)
        .where(eq(subjects.slug, s));
      return !!existing;
    });
    const subject = await db
      .insert(subjects)
      .values({
        slug,
        name: dto.name,
        examType: dto.examType,
      })
      .returning();

    return subject[0];
  }

  async findAll() {
    return db.select().from(subjects);
  }

  async findOne(id: string) {
    const subject = await db.select().from(subjects).where(eq(subjects.id, id));

    if (!subject.length) {
      throw new NotFoundException('Subject not found');
    }

    return subject[0];
  }

  async findOneBySlug(slug: string) {
    const [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.slug, slug));
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto) {
    const [existing] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id));
    if (!existing) {
      throw new NotFoundException('Subject not found');
    }
    const [updated] = await db
      .update(subjects)
      .set({
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.examType !== undefined && { examType: dto.examType }),
      })
      .where(eq(subjects.id, id))
      .returning();
    return updated ?? existing;
  }

  async remove(id: string) {
    const subject = await db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning();

    if (!subject.length) {
      throw new NotFoundException('Subject not found');
    }

    return { message: 'Subject deleted successfully' };
  }
}
