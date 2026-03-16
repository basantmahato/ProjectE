import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BlogService } from './blog.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

@ApiTags('Blog (Public)')
@Controller('blog')
export class BlogPublicController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  findPublishedPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (page !== undefined || limit !== undefined) {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 9;
      return this.blogService.findPublishedPostsPaginated(pageNum, limitNum);
    }
    return this.blogService.findPublishedPosts();
  }

  @Get('posts/slug/:slug')
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.blogService.findPublishedBySlug(slug);
  }

  @Get('posts/:id')
  findPublishedById(@Param('id') id: string) {
    return this.blogService.findPublishedById(id);
  }

  @Get('posts/:id/comments')
  getComments(@Param('id') postId: string) {
    return this.blogService.getCommentsWithReplies(postId);
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  addComment(
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.blogService.addComment(postId, req.user.userId, dto.content);
  }

  @Post('comments/:commentId/replies')
  @UseGuards(JwtAuthGuard)
  addReply(
    @Param('commentId') commentId: string,
    @Body() dto: CreateReplyDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.blogService.addReply(commentId, req.user.userId, dto.content);
  }
}
