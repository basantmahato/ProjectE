import { Injectable, NotFoundException } from "@nestjs/common";
import { db } from "../database/db";
import {
  notifications,
  userNotificationRead,
  userPushTokens,
} from "../database/schema/notification.schema";
import { eq, desc } from "drizzle-orm";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100;

@Injectable()
export class NotificationsService {
  async registerPushToken(
    userId: string,
    expoPushToken: string,
    deviceId?: string,
  ): Promise<{ ok: boolean }> {
    const existing = await db
      .select()
      .from(userPushTokens)
      .where(eq(userPushTokens.expoPushToken, expoPushToken));

    if (existing.length > 0) {
      await db
        .update(userPushTokens)
        .set({ userId, deviceId: deviceId ?? null, createdAt: new Date() })
        .where(eq(userPushTokens.expoPushToken, expoPushToken));
    } else {
      await db.insert(userPushTokens).values({
        userId,
        expoPushToken,
        deviceId: deviceId ?? null,
      });
    }
    return { ok: true };
  }

  async findAll(userId?: string | null) {
    const rows = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));

    let readSet: Set<string> = new Set();
    if (userId && rows.length > 0) {
      const readRows = await db
        .select({ notificationId: userNotificationRead.notificationId })
        .from(userNotificationRead)
        .where(eq(userNotificationRead.userId, userId));
      readSet = new Set(readRows.map((r) => r.notificationId));
    }

    return rows.map((row) => {
      const createdAt = row.createdAt ?? (row as unknown as { created_at?: Date }).created_at;
      return {
        id: row.id,
        title: row.title,
        body: row.body,
        type: row.type,
        createdAt:
          createdAt instanceof Date ? createdAt.toISOString() : String(createdAt ?? new Date().toISOString()),
        read: userId ? readSet.has(row.id) : false,
      };
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await db
      .insert(userNotificationRead)
      .values({ userId, notificationId })
      .onConflictDoNothing({
        target: [userNotificationRead.userId, userNotificationRead.notificationId],
      });
  }

  async findOne(id: string) {
    const [row] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    if (!row) throw new NotFoundException("Notification not found");
    return row;
  }

  async update(
    id: string,
    data: { title?: string; body?: string; type?: string },
  ) {
    const [row] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    if (!row) throw new NotFoundException("Notification not found");
    const [updated] = await db
      .update(notifications)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.body !== undefined && { body: data.body }),
        ...(data.type !== undefined && { type: data.type }),
      })
      .where(eq(notifications.id, id))
      .returning();
    return updated ?? row;
  }

  async delete(id: string): Promise<void> {
    const [row] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.id, id));
    if (!row) throw new NotFoundException("Notification not found");
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async createAndSendToUser(
    userId: string,
    title: string,
    body?: string,
    type: string = "info",
  ): Promise<{ id: string; pushed: number }> {
    const [created] = await db
      .insert(notifications)
      .values({ title, body: body ?? null, type })
      .returning({ id: notifications.id });

    if (!created) {
      throw new Error("Failed to create notification");
    }

    const tokens = await db
      .select({ expoPushToken: userPushTokens.expoPushToken })
      .from(userPushTokens)
      .where(eq(userPushTokens.userId, userId));

    const pushed = await this.sendPushToTokens(
      tokens.map((t) => t.expoPushToken),
      title,
      body ?? "",
    );

    return { id: created.id, pushed };
  }

  async createAndSend(
    title: string,
    body?: string,
    type: string = "info",
  ): Promise<{ id: string; pushed: number }> {
    const [created] = await db
      .insert(notifications)
      .values({ title, body: body ?? null, type })
      .returning({ id: notifications.id });

    if (!created) {
      throw new Error("Failed to create notification");
    }

    const tokens = await db
      .select({ expoPushToken: userPushTokens.expoPushToken })
      .from(userPushTokens);

    const pushed = await this.sendPushToTokens(
      tokens.map((t) => t.expoPushToken),
      title,
      body ?? "",
    );

    return { id: created.id, pushed };
  }

  private async sendPushToTokens(
    tokens: string[],
    title: string,
    body: string,
  ): Promise<number> {
    if (tokens.length === 0) return 0;

    let successCount = 0;
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const chunk = tokens.slice(i, i + BATCH_SIZE);
      const messages = chunk.map((to) => ({
        to,
        title,
        body,
        sound: "default" as const,
      }));

      try {
        const res = await fetch(EXPO_PUSH_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messages),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("[NotificationsService] Expo push error:", res.status, text);
          continue;
        }

        const data = (await res.json()) as { data?: { status?: string }[] };
        const results = Array.isArray(data) ? data : data?.data;
        if (results) {
          successCount += results.filter(
            (r) => r?.status === "ok",
          ).length;
        } else {
          successCount += chunk.length;
        }
      } catch (err) {
        console.error("[NotificationsService] Expo push request failed:", err);
      }
    }

    return successCount;
  }
}
