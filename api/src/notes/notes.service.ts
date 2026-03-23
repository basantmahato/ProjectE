import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../database/db';
import { notes } from '../database/schema/note.schema';
import { eq, asc } from 'drizzle-orm';
import { slugify, ensureUniqueSlug } from '../common/slug.util';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { BulkUploadNotesDto } from './dto/bulk-upload-notes.dto';
import { TopicsService } from '../topics/topics.service';

@Injectable()
export class NotesService {
  constructor(private readonly topicsService: TopicsService) {}

  async findAllNotesByTopicId(topicId: string) {
    await this.topicsService.findOne(topicId);
    return db
      .select()
      .from(notes)
      .where(eq(notes.topicId, topicId))
      .orderBy(asc(notes.orderIndex), asc(notes.createdAt));
  }

  async findOneNote(id: string) {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async findOneNoteBySlug(slug: string) {
    const [note] = await db.select().from(notes).where(eq(notes.slug, slug));
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async createNote(topicId: string, dto: CreateNoteDto) {
    await this.topicsService.findOne(topicId);
    const slug =
      dto.slug != null && dto.slug.trim() !== ''
        ? dto.slug.trim()
        : await ensureUniqueSlug(slugify(dto.title), async (s) => {
            const [existing] = await db
              .select()
              .from(notes)
              .where(eq(notes.slug, s));
            return !!existing;
          });
    if (dto.slug != null && dto.slug.trim() !== '') {
      const [existing] = await db
        .select()
        .from(notes)
        .where(eq(notes.slug, slug));
      if (existing) throw new ConflictException('Slug already exists');
    }
    const [created] = await db
      .insert(notes)
      .values({
        topicId,
        slug,
        title: dto.title,
        content: dto.content,
        orderIndex: dto.orderIndex ?? null,
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateNote(id: string, dto: UpdateNoteDto) {
    if (dto.slug != null && dto.slug.trim() !== '') {
      const [existing] = await db
        .select()
        .from(notes)
        .where(eq(notes.slug, dto.slug.trim()));
      if (existing && existing.id !== id)
        throw new ConflictException('Slug already exists');
    }
    const [updated] = await db
      .update(notes)
      .set({
        ...(dto.slug != null && { slug: dto.slug.trim() }),
        ...(dto.title != null && { title: dto.title }),
        ...(dto.content != null && { content: dto.content }),
        ...(dto.orderIndex != null && { orderIndex: dto.orderIndex }),
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();
    if (!updated) throw new NotFoundException('Note not found');
    return updated;
  }

  async removeNote(id: string) {
    const [deleted] = await db
      .delete(notes)
      .where(eq(notes.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Note not found');
    return { message: 'Note deleted successfully' };
  }

  async bulkCreate(dto: BulkUploadNotesDto) {
    const created = { count: 0 };
    const errors: { index: number; message: string }[] = [];
    for (let i = 0; i < dto.notes.length; i++) {
      const n = dto.notes[i];
      try {
        await this.createNote(dto.topicId, {
          slug: n.slug,
          title: n.title,
          content: n.content,
          orderIndex: n.orderIndex,
        });
        created.count += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push({ index: i, message });
      }
    }
    return { created, errors: errors.length ? errors : undefined };
  }
}
