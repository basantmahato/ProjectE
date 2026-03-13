import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { questionBank } from '../database/schema/questionBank.schema';
import { eq } from 'drizzle-orm';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';

@Injectable()
export class QuestionBankService {
  async create(dto: CreateQuestionBankDto) {
    const question = await db
      .insert(questionBank)
      .values({
        topicId: dto.topicId,
        questionText: dto.questionText,
        difficulty: dto.difficulty,
        marks: dto.marks,
        negativeMarks: dto.negativeMarks,
        explanation: dto.explanation,
      })
      .returning();

    return question[0];
  }

  async findAll() {
    return db.select().from(questionBank);
  }

  async findOne(id: string) {
    const question = await db
      .select()
      .from(questionBank)
      .where(eq(questionBank.id, id));

    if (!question.length) {
      throw new NotFoundException('Question not found');
    }

    return question[0];
  }

  async findByTopicId(topicId: string) {
    return db
      .select()
      .from(questionBank)
      .where(eq(questionBank.topicId, topicId));
  }

  async update(id: string, dto: UpdateQuestionBankDto) {
    const updated = await db
      .update(questionBank)
      .set({
        ...(dto.topicId != null && { topicId: dto.topicId }),
        ...(dto.questionText != null && { questionText: dto.questionText }),
        ...(dto.difficulty != null && { difficulty: dto.difficulty }),
        ...(dto.marks != null && { marks: dto.marks }),
        ...(dto.negativeMarks != null && { negativeMarks: dto.negativeMarks }),
        ...(dto.explanation != null && { explanation: dto.explanation }),
      })
      .where(eq(questionBank.id, id))
      .returning();

    if (!updated.length) {
      throw new NotFoundException('Question not found');
    }

    return updated[0];
  }

  async remove(id: string) {
    const question = await db
      .delete(questionBank)
      .where(eq(questionBank.id, id))
      .returning();

    if (!question.length) {
      throw new NotFoundException('Question not found');
    }

    return { message: 'Question deleted successfully' };
  }
}
