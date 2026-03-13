import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { questionOptions } from '../database/schema/questionOption.schema';
import { eq } from 'drizzle-orm';
import { CreateQuestionOptionDto } from './dto/create-question-option.dto';
import { UpdateQuestionOptionDto } from './dto/update-question-option.dto';

@Injectable()
export class QuestionOptionsService {
  async create(dto: CreateQuestionOptionDto) {
    const option = await db
      .insert(questionOptions)
      .values({
        questionId: dto.questionId,
        optionText: dto.optionText,
        isCorrect: dto.isCorrect ?? false,
      })
      .returning();

    return option[0];
  }

  async findAll() {
    return db.select().from(questionOptions);
  }

  async findOne(id: string) {
    const option = await db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.id, id));

    if (!option.length) {
      throw new NotFoundException('Question option not found');
    }

    return option[0];
  }

  async findByQuestionId(questionId: string) {
    return db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.questionId, questionId));
  }

  async update(id: string, dto: UpdateQuestionOptionDto) {
    const updated = await db
      .update(questionOptions)
      .set({
        ...(dto.questionId != null && { questionId: dto.questionId }),
        ...(dto.optionText != null && { optionText: dto.optionText }),
        ...(dto.isCorrect != null && { isCorrect: dto.isCorrect }),
      })
      .where(eq(questionOptions.id, id))
      .returning();

    if (!updated.length) {
      throw new NotFoundException('Question option not found');
    }

    return updated[0];
  }

  async remove(id: string) {
    const option = await db
      .delete(questionOptions)
      .where(eq(questionOptions.id, id))
      .returning();

    if (!option.length) {
      throw new NotFoundException('Question option not found');
    }

    return { message: 'Question option deleted successfully' };
  }
}
