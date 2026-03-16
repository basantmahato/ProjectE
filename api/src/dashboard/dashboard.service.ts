import { Injectable } from '@nestjs/common';
import { db } from '../database/db';
import { users } from '../database/schema/user.schema';
import { testAttempts } from '../database/schema/testAttempts';
import { tests } from '../database/schema/test.schema';
import { subjects } from '../database/schema/subjects.schema';
import { topics } from '../database/schema/topics.schema';
import { questionBank } from '../database/schema/questionBank.schema';
import { blogPosts } from '../database/schema/blogPost.schema';
import { notifications } from '../database/schema/notification.schema';
import { eq, and, isNotNull, desc, sql } from 'drizzle-orm';

export interface DashboardStats {
  totalMarks: number;
  accuracyPercent: number;
  mockTestsTaken: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string | null;
  totalMarks: number;
}

@Injectable()
export class DashboardService {
  async getStats(userId: string): Promise<DashboardStats> {
    const [user] = await db
      .select({ totalMarks: users.totalMarks })
      .from(users)
      .where(eq(users.id, userId));

    const submitted = await db
      .select({
        score: testAttempts.score,
        totalMarks: tests.totalMarks,
        isMock: tests.isMock,
      })
      .from(testAttempts)
      .innerJoin(tests, eq(testAttempts.testId, tests.id))
      .where(
        and(eq(testAttempts.userId, userId), isNotNull(testAttempts.submittedAt))
      );

    let accuracyPercent = 0;
    if (submitted.length > 0) {
      const totalScore = submitted.reduce((sum, r) => sum + (r.score ?? 0), 0);
      const totalPossible = submitted.reduce((sum, r) => sum + (r.totalMarks ?? 0), 0);
      accuracyPercent = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    }

    const mockTestsTaken = submitted.filter((r) => r.isMock === true).length;

    return {
      totalMarks: user?.totalMarks ?? 0,
      accuracyPercent,
      mockTestsTaken,
    };
  }

  async getAdminStats() {
    const count = sql<number>`count(*)::int`;
    const [[u], [s], [t], [q], [te], [mt], [bp], [n]] = await Promise.all([
      db.select({ count }).from(users),
      db.select({ count }).from(subjects),
      db.select({ count }).from(topics),
      db.select({ count }).from(questionBank),
      db.select({ count }).from(tests).where(eq(tests.isMock, false)),
      db.select({ count }).from(tests).where(eq(tests.isMock, true)),
      db.select({ count }).from(blogPosts),
      db.select({ count }).from(notifications),
    ]);
    return {
      users: u?.count ?? 0,
      subjects: s?.count ?? 0,
      topics: t?.count ?? 0,
      questions: q?.count ?? 0,
      tests: te?.count ?? 0,
      mockTests: mt?.count ?? 0,
      blogPosts: bp?.count ?? 0,
      notifications: n?.count ?? 0,
    };
  }

  async getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        totalMarks: users.totalMarks,
      })
      .from(users)
      .where(eq(users.role, 'user'))
      .orderBy(desc(users.totalMarks))
      .limit(Math.min(limit, 200));

    return rows.map((row, index) => ({
      id: row.id,
      rank: index + 1,
      name: row.name ?? 'Anonymous',
      totalMarks: row.totalMarks ?? 0,
    }));
  }
}
