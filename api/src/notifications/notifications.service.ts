import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { db } from "../database/db";
import {
  notifications,
  userNotificationRead,
  userPushTokens,
  userWebPushSubscriptions,
} from "../database/schema/notification.schema";
import { eq, desc, sql } from "drizzle-orm";
import * as webPush from "web-push";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100;
const WEB_PUSH_DEFAULT_URL = "/notifications";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  getVapidPublicKey(): string | null {
    const key = process.env.VAPID_PUBLIC_KEY?.trim();
    return key || null;
  }

  async registerWebPushSubscription(
    userId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
  ): Promise<{ ok: boolean }> {
    const existing = await db
      .select()
      .from(userWebPushSubscriptions)
      .where(eq(userWebPushSubscriptions.endpoint, endpoint));

    if (existing.length > 0) {
      await db
        .update(userWebPushSubscriptions)
        .set({ userId, p256dh, auth, createdAt: new Date() })
        .where(eq(userWebPushSubscriptions.endpoint, endpoint));
    } else {
      await db.insert(userWebPushSubscriptions).values({
        userId,
        endpoint,
        p256dh,
        auth,
      });
    }
    return { ok: true };
  }

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

  async findAll(userId?: string | null, page = 1, limit = 20) {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(50, Math.max(1, limit));
    const offset = (pageNum - 1) * limitNum;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications);
    const total = countResult?.count ?? 0;

    const rows = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(limitNum)
      .offset(offset);

    let readSet: Set<string> = new Set();
    if (userId && rows.length > 0) {
      const readRows = await db
        .select({ notificationId: userNotificationRead.notificationId })
        .from(userNotificationRead)
        .where(eq(userNotificationRead.userId, userId));
      readSet = new Set(readRows.map((r) => r.notificationId));
    }

    const data = rows.map((row) => {
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

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
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

    const pushedExpo = await this.sendPushToTokens(
      tokens.map((t) => t.expoPushToken),
      title,
      body ?? "",
    );

    const webSubs = await db
      .select({
        endpoint: userWebPushSubscriptions.endpoint,
        p256dh: userWebPushSubscriptions.p256dh,
        auth: userWebPushSubscriptions.auth,
      })
      .from(userWebPushSubscriptions)
      .where(eq(userWebPushSubscriptions.userId, userId));
    const pushedWeb = await this.sendWebPushToSubscriptions(
      webSubs,
      title,
      body ?? "",
    );

    return { id: created.id, pushed: pushedExpo + pushedWeb };
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

    const pushedExpo = await this.sendPushToTokens(
      tokens.map((t) => t.expoPushToken),
      title,
      body ?? "",
    );

    const webSubs = await db
      .select({
        endpoint: userWebPushSubscriptions.endpoint,
        p256dh: userWebPushSubscriptions.p256dh,
        auth: userWebPushSubscriptions.auth,
      })
      .from(userWebPushSubscriptions);
    const pushedWeb = await this.sendWebPushToSubscriptions(
      webSubs,
      title,
      body ?? "",
    );

    return { id: created.id, pushed: pushedExpo + pushedWeb };
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
          this.logger.error(`Expo push error: ${res.status} ${text}`);
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
        this.logger.error("Expo push request failed", err instanceof Error ? err.stack : String(err));
      }
    }

    return successCount;
  }

  private async sendWebPushToSubscriptions(
    subscriptions: { endpoint: string; p256dh: string; auth: string }[],
    title: string,
    body: string,
    url: string = WEB_PUSH_DEFAULT_URL,
  ): Promise<number> {
    if (subscriptions.length === 0) return 0;
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      this.logger.warn("Web push skipped: VAPID keys not set");
      return 0;
    }
    try {
      webPush.setVapidDetails(
        "mailto:admin@example.com",
        publicKey,
        privateKey,
      );
    } catch (err) {
      this.logger.error("Web push VAPID setup failed", err instanceof Error ? err.stack : String(err));
      return 0;
    }

    const payload = JSON.stringify({ title, body, url });
    let successCount = 0;
    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
        successCount += 1;
      } catch (err) {
        this.logger.warn(`Web push failed for endpoint: ${sub.endpoint?.slice(0, 50)}`);
      }
    }
    return successCount;
  }
}
