import { Injectable } from '@nestjs/common';
import { db } from '../database/db';
import { users } from '../database/schema/user.schema';
import { testAttempts } from '../database/schema/testAttempts';
import { tests } from '../database/schema/test.schema';
import { eq, and, isNotNull, desc } from 'drizzle-orm';

export interface DashboardStats {
  totalMarks: number;
  accuracyPercent: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string | null;
  totalMarks: number;
}

@Injectable()
export class DashbaordService {
  async getStats(userId: string): Promise<DashboardStats> {
    const [user] = await db
      .select({ totalMarks: users.totalMarks })
      .from(users)
      .where(eq(users.id, userId));

    const submitted = await db
      .select({
        score: testAttempts.score,
        totalMarks: tests.totalMarks,
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

    return {
      totalMarks: user?.totalMarks ?? 0,
      accuracyPercent,
    };
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        totalMarks: users.totalMarks,
      })
      .from(users)
      .where(eq(users.role, 'user'))
      .orderBy(desc(users.totalMarks));

    return rows.map((row, index) => ({
      id: row.id,
      rank: index + 1,
      name: row.name ?? 'Anonymous',
      totalMarks: row.totalMarks ?? 0,
    }));
  }
}
