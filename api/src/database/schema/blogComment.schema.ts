import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { blogPosts } from './blogPost.schema';
import { users } from './user.schema';

export const blogComments = pgTable('blog_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id')
    .notNull()
    .references(() => blogPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
