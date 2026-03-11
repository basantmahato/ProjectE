import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { subjects } from '../database/schema/subjects.schema';
import { eq } from 'drizzle-orm';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {

  async create(dto: CreateSubjectDto) {
    const subject = await db
      .insert(subjects)
      .values({
        name: dto.name,
        examType: dto.examType
      })
      .returning();

    return subject[0];
  }

  async findAll() {
    return db.select().from(subjects);
  }

  async findOne(id: string) {
    const subject = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id));

    if (!subject.length) {
      throw new NotFoundException('Subject not found');
    }

    return subject[0];
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