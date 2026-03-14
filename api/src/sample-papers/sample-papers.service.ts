import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../database/db';
import { samplePapers } from '../database/schema/samplePaper.schema';
import { samplePaperViews } from '../database/schema/samplePaperView.schema';
import { samplePaperSubjects } from '../database/schema/samplePaperSubject.schema';
import { samplePaperTopics } from '../database/schema/samplePaperTopic.schema';
import { samplePaperQuestions } from '../database/schema/samplePaperQuestion.schema';
import { samplePaperQuestionOptions } from '../database/schema/samplePaperQuestionOption.schema';
import { users } from '../database/schema/user.schema';
import { PLAN_FEATURES, type PlanId } from '../billing/plan-features';
import { eq, asc, and, sql } from 'drizzle-orm';
import { CreateSamplePaperDto } from './dto/create-sample-paper.dto';
import { UpdateSamplePaperDto } from './dto/update-sample-paper.dto';
import { CreateSamplePaperSubjectDto } from './dto/create-sample-paper-subject.dto';
import { UpdateSamplePaperSubjectDto } from './dto/update-sample-paper-subject.dto';
import { CreateSamplePaperTopicDto } from './dto/create-sample-paper-topic.dto';
import { UpdateSamplePaperTopicDto } from './dto/update-sample-paper-topic.dto';
import { CreateSamplePaperQuestionDto } from './dto/create-sample-paper-question.dto';
import { UpdateSamplePaperQuestionDto } from './dto/update-sample-paper-question.dto';
import { CreateSamplePaperQuestionOptionDto } from './dto/create-sample-paper-question-option.dto';
import { UpdateSamplePaperQuestionOptionDto } from './dto/update-sample-paper-question-option.dto';

@Injectable()
export class SamplePapersService {
  // --- Sample Papers ---
  async createPaper(dto: CreateSamplePaperDto) {
    const [paper] = await db
      .insert(samplePapers)
      .values({
        title: dto.title,
        description: dto.description ?? null,
      })
      .returning();
    return paper;
  }

  async findAllPapers() {
    return db.select().from(samplePapers).orderBy(asc(samplePapers.createdAt));
  }

  async findOnePaper(id: string) {
    const [paper] = await db
      .select()
      .from(samplePapers)
      .where(eq(samplePapers.id, id));
    if (!paper) throw new NotFoundException('Sample paper not found');
    return paper;
  }

  async updatePaper(id: string, dto: UpdateSamplePaperDto) {
    const [updated] = await db
      .update(samplePapers)
      .set({
        ...(dto.title != null && { title: dto.title }),
        ...(dto.description != null && { description: dto.description }),
      })
      .where(eq(samplePapers.id, id))
      .returning();
    if (!updated) throw new NotFoundException('Sample paper not found');
    return updated;
  }

  async removePaper(id: string) {
    const [deleted] = await db
      .delete(samplePapers)
      .where(eq(samplePapers.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Sample paper not found');
    return { message: 'Sample paper deleted successfully' };
  }

  // --- Subjects ---
  async createSubject(paperId: string, dto: CreateSamplePaperSubjectDto) {
    await this.findOnePaper(paperId);
    const [subject] = await db
      .insert(samplePaperSubjects)
      .values({
        samplePaperId: paperId,
        name: dto.name,
      })
      .returning();
    return subject;
  }

  async findSubjectsByPaperId(paperId: string) {
    await this.findOnePaper(paperId);
    return db
      .select()
      .from(samplePaperSubjects)
      .where(eq(samplePaperSubjects.samplePaperId, paperId))
      .orderBy(asc(samplePaperSubjects.createdAt));
  }

  async findOneSubject(subjectId: string) {
    const [s] = await db
      .select()
      .from(samplePaperSubjects)
      .where(eq(samplePaperSubjects.id, subjectId));
    if (!s) throw new NotFoundException('Sample paper subject not found');
    return s;
  }

  async updateSubject(
    subjectId: string,
    dto: UpdateSamplePaperSubjectDto,
  ) {
    const [updated] = await db
      .update(samplePaperSubjects)
      .set({
        ...(dto.name != null && { name: dto.name }),
      })
      .where(eq(samplePaperSubjects.id, subjectId))
      .returning();
    if (!updated) throw new NotFoundException('Sample paper subject not found');
    return updated;
  }

  async removeSubject(subjectId: string) {
    const [deleted] = await db
      .delete(samplePaperSubjects)
      .where(eq(samplePaperSubjects.id, subjectId))
      .returning();
    if (!deleted) throw new NotFoundException('Sample paper subject not found');
    return { message: 'Subject deleted successfully' };
  }

  // --- Topics ---
  async createTopic(subjectId: string, dto: CreateSamplePaperTopicDto) {
    await this.findOneSubject(subjectId);
    const [topic] = await db
      .insert(samplePaperTopics)
      .values({
        samplePaperSubjectId: subjectId,
        name: dto.name,
      })
      .returning();
    return topic;
  }

  async findTopicsBySubjectId(subjectId: string) {
    await this.findOneSubject(subjectId);
    return db
      .select()
      .from(samplePaperTopics)
      .where(eq(samplePaperTopics.samplePaperSubjectId, subjectId))
      .orderBy(asc(samplePaperTopics.createdAt));
  }

  async findOneTopic(topicId: string) {
    const [t] = await db
      .select()
      .from(samplePaperTopics)
      .where(eq(samplePaperTopics.id, topicId));
    if (!t) throw new NotFoundException('Sample paper topic not found');
    return t;
  }

  async updateTopic(topicId: string, dto: UpdateSamplePaperTopicDto) {
    const [updated] = await db
      .update(samplePaperTopics)
      .set({
        ...(dto.name != null && { name: dto.name }),
      })
      .where(eq(samplePaperTopics.id, topicId))
      .returning();
    if (!updated) throw new NotFoundException('Sample paper topic not found');
    return updated;
  }

  async removeTopic(topicId: string) {
    const [deleted] = await db
      .delete(samplePaperTopics)
      .where(eq(samplePaperTopics.id, topicId))
      .returning();
    if (!deleted) throw new NotFoundException('Sample paper topic not found');
    return { message: 'Topic deleted successfully' };
  }

  // --- Questions ---
  async createQuestion(topicId: string, dto: CreateSamplePaperQuestionDto) {
    await this.findOneTopic(topicId);
    const [q] = await db
      .insert(samplePaperQuestions)
      .values({
        samplePaperTopicId: topicId,
        questionText: dto.questionText,
        explanation: dto.explanation ?? null,
        orderIndex: dto.orderIndex ?? 0,
      })
      .returning();
    return q;
  }

  async findQuestionsByTopicId(topicId: string) {
    await this.findOneTopic(topicId);
    return db
      .select()
      .from(samplePaperQuestions)
      .where(eq(samplePaperQuestions.samplePaperTopicId, topicId))
      .orderBy(asc(samplePaperQuestions.orderIndex), asc(samplePaperQuestions.createdAt));
  }

  async findOneQuestion(questionId: string) {
    const [q] = await db
      .select()
      .from(samplePaperQuestions)
      .where(eq(samplePaperQuestions.id, questionId));
    if (!q) throw new NotFoundException('Sample paper question not found');
    return q;
  }

  async updateQuestion(
    questionId: string,
    dto: UpdateSamplePaperQuestionDto,
  ) {
    const [updated] = await db
      .update(samplePaperQuestions)
      .set({
        ...(dto.questionText != null && { questionText: dto.questionText }),
        ...(dto.explanation != null && { explanation: dto.explanation }),
        ...(dto.orderIndex != null && { orderIndex: dto.orderIndex }),
      })
      .where(eq(samplePaperQuestions.id, questionId))
      .returning();
    if (!updated) throw new NotFoundException('Sample paper question not found');
    return updated;
  }

  async removeQuestion(questionId: string) {
    const [deleted] = await db
      .delete(samplePaperQuestions)
      .where(eq(samplePaperQuestions.id, questionId))
      .returning();
    if (!deleted) throw new NotFoundException('Sample paper question not found');
    return { message: 'Question deleted successfully' };
  }

  // --- Question Options (answers) ---
  async createOption(
    questionId: string,
    dto: CreateSamplePaperQuestionOptionDto,
  ) {
    await this.findOneQuestion(questionId);
    const [opt] = await db
      .insert(samplePaperQuestionOptions)
      .values({
        samplePaperQuestionId: questionId,
        optionText: dto.optionText,
        isCorrect: dto.isCorrect ?? false,
      })
      .returning();
    return opt;
  }

  async findOptionsByQuestionId(questionId: string) {
    await this.findOneQuestion(questionId);
    return db
      .select()
      .from(samplePaperQuestionOptions)
      .where(eq(samplePaperQuestionOptions.samplePaperQuestionId, questionId));
  }

  async findOneOption(optionId: string) {
    const [o] = await db
      .select()
      .from(samplePaperQuestionOptions)
      .where(eq(samplePaperQuestionOptions.id, optionId));
    if (!o) throw new NotFoundException('Sample paper question option not found');
    return o;
  }

  async updateOption(
    optionId: string,
    dto: UpdateSamplePaperQuestionOptionDto,
  ) {
    const [updated] = await db
      .update(samplePaperQuestionOptions)
      .set({
        ...(dto.optionText != null && { optionText: dto.optionText }),
        ...(dto.isCorrect != null && { isCorrect: dto.isCorrect }),
      })
      .where(eq(samplePaperQuestionOptions.id, optionId))
      .returning();
    if (!updated) throw new NotFoundException('Sample paper question option not found');
    return updated;
  }

  async removeOption(optionId: string) {
    const [deleted] = await db
      .delete(samplePaperQuestionOptions)
      .where(eq(samplePaperQuestionOptions.id, optionId))
      .returning();
    if (!deleted) throw new NotFoundException('Sample paper question option not found');
    return { message: 'Option deleted successfully' };
  }

  // --- Public: get full paper tree for reading (no plan limit) ---
  async findPaperWithFullTree(paperId: string) {
    const paper = await this.findOnePaper(paperId);
    const subjects = await this.findSubjectsByPaperId(paperId);
    const subjectsWithTree = await Promise.all(
      subjects.map(async (subj) => {
        const topics = await this.findTopicsBySubjectId(subj.id);
        const topicsWithQuestions = await Promise.all(
          topics.map(async (topic) => {
            const questions = await this.findQuestionsByTopicId(topic.id);
            const questionsWithOptions = await Promise.all(
              questions.map(async (q) => {
                const options = await this.findOptionsByQuestionId(q.id);
                return { ...q, options };
              }),
            );
            return { ...topic, questions: questionsWithOptions };
          }),
        );
        return { ...subj, topics: topicsWithQuestions };
      }),
    );
    return { ...paper, subjects: subjectsWithTree };
  }

  /** Public: get full paper tree with free-tier limit. Supports logged-in user or guest (deviceId). */
  async findPaperWithFullTreeForUserOrGuest(
    paperId: string,
    userId: string | null,
    deviceId: string | null,
  ) {
    const FREE_TIER_SAMPLE_PAPERS = 10;
    const monthStart = sql`date_trunc('month', now())`;
    const monthEnd = sql`date_trunc('month', now()) + interval '1 month'`;

    if (userId) {
      const [user] = await db
        .select({ plan: users.plan })
        .from(users)
        .where(eq(users.id, userId));
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const plan = user.plan as PlanId;
      const maxSamplePapers = PLAN_FEATURES[plan].maxSamplePapersPerMonth;

      if (maxSamplePapers >= 0) {
        const viewsThisMonth = await db
          .selectDistinct({ samplePaperId: samplePaperViews.samplePaperId })
          .from(samplePaperViews)
          .where(
            and(
              eq(samplePaperViews.userId, userId),
              sql`${samplePaperViews.viewedAt} >= ${monthStart}`,
              sql`${samplePaperViews.viewedAt} < ${monthEnd}`,
            ),
          );
        const distinctCount = viewsThisMonth.length;
        const alreadyViewedThisMonth = viewsThisMonth.some((v) => v.samplePaperId === paperId);
        if (distinctCount >= maxSamplePapers && !alreadyViewedThisMonth) {
          throw new ForbiddenException({
            message: 'Free plan limited to 10 sample papers per month. Upgrade to Basic for more.',
            code: 'PLAN_UPGRADE_REQUIRED',
          });
        }
        await db.insert(samplePaperViews).values({
          userId,
          samplePaperId: paperId,
        });
      }
    } else if (deviceId) {
      const viewsThisMonth = await db
        .selectDistinct({ samplePaperId: samplePaperViews.samplePaperId })
        .from(samplePaperViews)
        .where(
          and(
            eq(samplePaperViews.deviceId, deviceId),
            sql`${samplePaperViews.viewedAt} >= ${monthStart}`,
            sql`${samplePaperViews.viewedAt} < ${monthEnd}`,
          ),
        );
      const distinctCount = viewsThisMonth.length;
      const alreadyViewedThisMonth = viewsThisMonth.some((v) => v.samplePaperId === paperId);
      if (distinctCount >= FREE_TIER_SAMPLE_PAPERS && !alreadyViewedThisMonth) {
        throw new ForbiddenException({
          message: 'Free tier limited to 10 sample papers per month. Sign in or upgrade for more.',
          code: 'PLAN_UPGRADE_REQUIRED',
        });
      }
      await db.insert(samplePaperViews).values({
        deviceId,
        samplePaperId: paperId,
      });
    } else {
      throw new BadRequestException(
        'Provide Authorization header (logged-in) or X-Device-ID header (guest) to view sample papers.',
      );
    }

    return this.findPaperWithFullTree(paperId);
  }
}
