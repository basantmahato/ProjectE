import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { blogComments } from './blogComment.schema';
import { users } from './user.schema';

export const blogCommentReplies = pgTable('blog_comment_replies', {
  id: uuid('id').defaultRandom().primaryKey(),
  commentId: uuid('comment_id')
    .notNull()
    .references(() => blogComments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
