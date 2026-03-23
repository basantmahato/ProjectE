import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { interviewPrepJobRoles } from '../database/schema/interviewPrepJobRole.schema';
import { interviewPrepTopics } from '../database/schema/interviewPrepTopic.schema';
import { interviewPrepSubtopics } from '../database/schema/interviewPrepSubtopic.schema';
import { eq, asc } from 'drizzle-orm';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';
import { CreateInterviewPrepTopicDto } from './dto/create-topic.dto';
import { UpdateInterviewPrepTopicDto } from './dto/update-topic.dto';
import { CreateSubtopicDto } from './dto/create-subtopic.dto';
import { UpdateSubtopicDto } from './dto/update-subtopic.dto';
import { BulkUploadInterviewPrepDto } from './dto/bulk-upload-interview-prep.dto';

@Injectable()
export class InterviewPrepService {
  // --- Job Roles ---
  async createJobRole(dto: CreateJobRoleDto) {
    const [role] = await db
      .insert(interviewPrepJobRoles)
      .values({
        name: dto.name,
        description: dto.description ?? null,
      })
      .returning();
    return role;
  }

  async findAllJobRoles() {
    return db
      .select()
      .from(interviewPrepJobRoles)
      .orderBy(asc(interviewPrepJobRoles.createdAt));
  }

  async findOneJobRole(id: string) {
    const [role] = await db
      .select()
      .from(interviewPrepJobRoles)
      .where(eq(interviewPrepJobRoles.id, id));
    if (!role) throw new NotFoundException('Job role not found');
    return role;
  }

  async updateJobRole(id: string, dto: UpdateJobRoleDto) {
    const [updated] = await db
      .update(interviewPrepJobRoles)
      .set({
        ...(dto.name != null && { name: dto.name }),
        ...(dto.description != null && { description: dto.description }),
      })
      .where(eq(interviewPrepJobRoles.id, id))
      .returning();
    if (!updated) throw new NotFoundException('Job role not found');
    return updated;
  }

  async removeJobRole(id: string) {
    const [deleted] = await db
      .delete(interviewPrepJobRoles)
      .where(eq(interviewPrepJobRoles.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Job role not found');
    return { message: 'Job role deleted successfully' };
  }

  // --- Topics ---
  async createTopic(jobRoleId: string, dto: CreateInterviewPrepTopicDto) {
    await this.findOneJobRole(jobRoleId);
    const [topic] = await db
      .insert(interviewPrepTopics)
      .values({
        jobRoleId,
        name: dto.name,
        explanation: dto.explanation ?? null,
        orderIndex: dto.orderIndex ?? 0,
      })
      .returning();
    return topic;
  }

  async findTopicsByJobRoleId(jobRoleId: string) {
    await this.findOneJobRole(jobRoleId);
    return db
      .select()
      .from(interviewPrepTopics)
      .where(eq(interviewPrepTopics.jobRoleId, jobRoleId))
      .orderBy(
        asc(interviewPrepTopics.orderIndex),
        asc(interviewPrepTopics.createdAt),
      );
  }

  async findOneTopic(topicId: string) {
    const [t] = await db
      .select()
      .from(interviewPrepTopics)
      .where(eq(interviewPrepTopics.id, topicId));
    if (!t) throw new NotFoundException('Topic not found');
    return t;
  }

  async updateTopic(topicId: string, dto: UpdateInterviewPrepTopicDto) {
    const [updated] = await db
      .update(interviewPrepTopics)
      .set({
        ...(dto.name != null && { name: dto.name }),
        ...(dto.explanation != null && { explanation: dto.explanation }),
        ...(dto.orderIndex != null && { orderIndex: dto.orderIndex }),
      })
      .where(eq(interviewPrepTopics.id, topicId))
      .returning();
    if (!updated) throw new NotFoundException('Topic not found');
    return updated;
  }

  async removeTopic(topicId: string) {
    const [deleted] = await db
      .delete(interviewPrepTopics)
      .where(eq(interviewPrepTopics.id, topicId))
      .returning();
    if (!deleted) throw new NotFoundException('Topic not found');
    return { message: 'Topic deleted successfully' };
  }

  // --- Subtopics ---
  async createSubtopic(topicId: string, dto: CreateSubtopicDto) {
    await this.findOneTopic(topicId);
    const [sub] = await db
      .insert(interviewPrepSubtopics)
      .values({
        topicId,
        name: dto.name,
        explanation: dto.explanation ?? null,
        orderIndex: dto.orderIndex ?? 0,
      })
      .returning();
    return sub;
  }

  async findSubtopicsByTopicId(topicId: string) {
    await this.findOneTopic(topicId);
    return db
      .select()
      .from(interviewPrepSubtopics)
      .where(eq(interviewPrepSubtopics.topicId, topicId))
      .orderBy(
        asc(interviewPrepSubtopics.orderIndex),
        asc(interviewPrepSubtopics.createdAt),
      );
  }

  async findOneSubtopic(subtopicId: string) {
    const [s] = await db
      .select()
      .from(interviewPrepSubtopics)
      .where(eq(interviewPrepSubtopics.id, subtopicId));
    if (!s) throw new NotFoundException('Subtopic not found');
    return s;
  }

  async updateSubtopic(subtopicId: string, dto: UpdateSubtopicDto) {
    const [updated] = await db
      .update(interviewPrepSubtopics)
      .set({
        ...(dto.name != null && { name: dto.name }),
        ...(dto.explanation != null && { explanation: dto.explanation }),
        ...(dto.orderIndex != null && { orderIndex: dto.orderIndex }),
      })
      .where(eq(interviewPrepSubtopics.id, subtopicId))
      .returning();
    if (!updated) throw new NotFoundException('Subtopic not found');
    return updated;
  }

  async removeSubtopic(subtopicId: string) {
    const [deleted] = await db
      .delete(interviewPrepSubtopics)
      .where(eq(interviewPrepSubtopics.id, subtopicId))
      .returning();
    if (!deleted) throw new NotFoundException('Subtopic not found');
    return { message: 'Subtopic deleted successfully' };
  }

  /** Bulk create job roles with optional topics and subtopics. */
  async bulkCreate(dto: BulkUploadInterviewPrepDto) {
    const created = { jobRoles: 0 };
    const errors: { index: number; message: string }[] = [];
    for (let i = 0; i < dto.jobRoles.length; i++) {
      const roleItem = dto.jobRoles[i];
      try {
        const role = await this.createJobRole({
          name: roleItem.name,
          description: roleItem.description,
        });
        created.jobRoles += 1;
        for (const top of roleItem.topics ?? []) {
          const topic = await this.createTopic(role.id, {
            name: top.name,
            explanation: top.explanation,
            orderIndex: top.orderIndex,
          });
          for (const sub of top.subtopics ?? []) {
            await this.createSubtopic(topic.id, {
              name: sub.name,
              explanation: sub.explanation,
              orderIndex: sub.orderIndex,
            });
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push({ index: i, message });
      }
    }
    return { created, errors: errors.length ? errors : undefined };
  }

  // --- Public: full tree for reading ---
  async findJobRoleWithFullTree(jobRoleId: string) {
    const role = await this.findOneJobRole(jobRoleId);
    const topics = await this.findTopicsByJobRoleId(jobRoleId);
    const topicsWithSubtopics = await Promise.all(
      topics.map(async (topic) => {
        const subtopics = await this.findSubtopicsByTopicId(topic.id);
        return { ...topic, subtopics };
      }),
    );
    return { ...role, topics: topicsWithSubtopics };
  }
}
