import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../database/db';
import { blogPosts } from '../database/schema/blogPost.schema';
import { blogComments } from '../database/schema/blogComment.schema';
import { blogCommentReplies } from '../database/schema/blogCommentReply.schema';
import { users } from '../database/schema/user.schema';
import { eq, desc, and, asc, sql } from 'drizzle-orm';
import { slugify, ensureUniqueSlug } from '../common/slug.util';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogService {
  // --- Admin: CRUD posts ---
  async createPost(dto: CreateBlogPostDto, authorId: string) {
    const slug =
      dto.slug != null && dto.slug.trim() !== ''
        ? dto.slug.trim()
        : await ensureUniqueSlug(slugify(dto.title), async (s) => {
            const [existing] = await db
              .select()
              .from(blogPosts)
              .where(eq(blogPosts.slug, s));
            return !!existing;
          });
    if (dto.slug != null && dto.slug.trim() !== '') {
      const [existing] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug));
      if (existing) throw new ConflictException('Slug already exists');
    }

    const [post] = await db
      .insert(blogPosts)
      .values({
        slug,
        title: dto.title,
        content: dto.content,
        excerpt: dto.excerpt ?? null,
        featuredImage: dto.featuredImage ?? null,
        images: dto.images ?? null,
        metaTitle: dto.metaTitle ?? null,
        metaDescription: dto.metaDescription ?? null,
        metaKeywords: dto.metaKeywords ?? null,
        canonicalUrl: dto.canonicalUrl ?? null,
        ogTitle: dto.ogTitle ?? null,
        ogDescription: dto.ogDescription ?? null,
        ogImage: dto.ogImage ?? null,
        twitterCard: dto.twitterCard ?? null,
        twitterTitle: dto.twitterTitle ?? null,
        twitterDescription: dto.twitterDescription ?? null,
        twitterImage: dto.twitterImage ?? null,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
        authorId,
        updatedAt: new Date(),
      })
      .returning();
    return post;
  }

  async findAllPostsAdmin() {
    return db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
  }

  async findOnePostAdmin(id: string) {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async updatePost(id: string, dto: UpdateBlogPostDto) {
    if (dto.slug) {
      const [existing] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, dto.slug));
      if (existing && existing.id !== id)
        throw new ConflictException('Slug already exists');
    }

    const [updated] = await db
      .update(blogPosts)
      .set({
        ...(dto.slug != null && { slug: dto.slug }),
        ...(dto.title != null && { title: dto.title }),
        ...(dto.content != null && { content: dto.content }),
        ...(dto.excerpt != null && { excerpt: dto.excerpt }),
        ...(dto.featuredImage != null && { featuredImage: dto.featuredImage }),
        ...(dto.images != null && { images: dto.images }),
        ...(dto.metaTitle != null && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription != null && { metaDescription: dto.metaDescription }),
        ...(dto.metaKeywords != null && { metaKeywords: dto.metaKeywords }),
        ...(dto.canonicalUrl != null && { canonicalUrl: dto.canonicalUrl }),
        ...(dto.ogTitle != null && { ogTitle: dto.ogTitle }),
        ...(dto.ogDescription != null && { ogDescription: dto.ogDescription }),
        ...(dto.ogImage != null && { ogImage: dto.ogImage }),
        ...(dto.twitterCard != null && { twitterCard: dto.twitterCard }),
        ...(dto.twitterTitle != null && { twitterTitle: dto.twitterTitle }),
        ...(dto.twitterDescription != null && { twitterDescription: dto.twitterDescription }),
        ...(dto.twitterImage != null && { twitterImage: dto.twitterImage }),
        ...(dto.isPublished != null && {
          isPublished: dto.isPublished,
          publishedAt: dto.isPublished ? new Date() : undefined, // set/update when publishing
        }),
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    if (!updated) throw new NotFoundException('Post not found');
    return updated;
  }

  async removePost(id: string) {
    const [deleted] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Post not found');
    return { message: 'Post deleted successfully' };
  }

  // --- Public: list published, get by id or slug ---
  async findPublishedPosts() {
    return db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        publishedAt: blogPosts.publishedAt,
        updatedAt: blogPosts.updatedAt,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
      })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async findPublishedPostsPaginated(page: number = 1, limit: number = 9) {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(50, Math.max(1, limit));
    const offset = (pageNum - 1) * limitNum;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true));

    const total = countResult?.count ?? 0;
    const data = await db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        publishedAt: blogPosts.publishedAt,
        updatedAt: blogPosts.updatedAt,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
      })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limitNum)
      .offset(offset);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  async findPublishedBySlug(slug: string) {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(
        and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)),
      );
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findPublishedById(id: string) {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(
        and(eq(blogPosts.id, id), eq(blogPosts.isPublished, true)),
      );
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // --- Comments with replies (for a post) ---
  async getCommentsWithReplies(postId: string) {
    const comments = await db
      .select({
        id: blogComments.id,
        postId: blogComments.postId,
        userId: blogComments.userId,
        content: blogComments.content,
        createdAt: blogComments.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(blogComments)
      .leftJoin(users, eq(blogComments.userId, users.id))
      .where(eq(blogComments.postId, postId))
      .orderBy(asc(blogComments.createdAt));

    const replies = await db
      .select({
        id: blogCommentReplies.id,
        commentId: blogCommentReplies.commentId,
        userId: blogCommentReplies.userId,
        content: blogCommentReplies.content,
        createdAt: blogCommentReplies.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(blogCommentReplies)
      .leftJoin(users, eq(blogCommentReplies.userId, users.id))
      .orderBy(asc(blogCommentReplies.createdAt));

    const replyMap = new Map<string, typeof replies>();
    for (const r of replies) {
      const list = replyMap.get(r.commentId) ?? [];
      list.push(r);
      replyMap.set(r.commentId, list);
    }

    return comments.map((c) => ({
      ...c,
      replies: replyMap.get(c.id) ?? [],
    }));
  }

  async addComment(postId: string, userId: string, content: string) {
    await this.findPublishedById(postId);
    const [comment] = await db
      .insert(blogComments)
      .values({ postId, userId, content })
      .returning();
    return comment;
  }

  async addReply(commentId: string, userId: string, content: string) {
    const [comment] = await db
      .select()
      .from(blogComments)
      .where(eq(blogComments.id, commentId));
    if (!comment) throw new NotFoundException('Comment not found');
    const [reply] = await db
      .insert(blogCommentReplies)
      .values({ commentId, userId, content })
      .returning();
    return reply;
  }
}
