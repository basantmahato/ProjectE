import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { topics } from '../database/schema/topics.schema';
import { eq } from 'drizzle-orm';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  async create(dto: CreateTopicDto) {
    const topic = await db
      .insert(topics)
      .values({
        subjectId: dto.subjectId,
        name: dto.name,
      })
      .returning();

    return topic[0];
  }

  async findAll() {
    return db.select().from(topics);
  }

  async findOne(id: string) {
    const topic = await db
      .select()
      .from(topics)
      .where(eq(topics.id, id));

    if (!topic.length) {
      throw new NotFoundException('Topic not found');
    }

    return topic[0];
  }

  async findBySubjectId(subjectId: string) {
    return db
      .select()
      .from(topics)
      .where(eq(topics.subjectId, subjectId));
  }

  async update(id: string, dto: UpdateTopicDto) {
    const updated = await db
      .update(topics)
      .set({
        ...(dto.subjectId != null && { subjectId: dto.subjectId }),
        ...(dto.name != null && { name: dto.name }),
      })
      .where(eq(topics.id, id))
      .returning();

    if (!updated.length) {
      throw new NotFoundException('Topic not found');
    }

    return updated[0];
  }

  async remove(id: string) {
    const topic = await db
      .delete(topics)
      .where(eq(topics.id, id))
      .returning();

    if (!topic.length) {
      throw new NotFoundException('Topic not found');
    }

    return { message: 'Topic deleted successfully' };
  }
}
