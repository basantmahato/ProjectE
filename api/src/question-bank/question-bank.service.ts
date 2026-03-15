import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { questionBank } from '../database/schema/questionBank.schema';
import { eq } from 'drizzle-orm';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import { BulkUploadQuestionsDto } from './dto/bulk-upload-questions.dto';
import { QuestionOptionsService } from '../question-options/question-options.service';

@Injectable()
export class QuestionBankService {
  constructor(private readonly questionOptionsService: QuestionOptionsService) {}

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

  async bulkCreate(dto: BulkUploadQuestionsDto) {
    const created = { questions: 0, options: 0 };
    const errors: { index: number; message: string }[] = [];

    for (let i = 0; i < dto.questions.length; i++) {
      const q = dto.questions[i];
      try {
        const question = await this.create({
          topicId: dto.topicId,
          questionText: q.questionText,
          difficulty: q.difficulty,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          explanation: q.explanation,
        });
        created.questions += 1;

        if (q.options?.length) {
          for (const opt of q.options) {
            await this.questionOptionsService.create({
              questionId: question.id,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect ?? false,
            });
            created.options += 1;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push({ index: i, message });
      }
    }

    return {
      created,
      errors: errors.length ? errors : undefined,
    };
  }
}
