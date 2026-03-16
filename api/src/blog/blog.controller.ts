import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@ApiTags('Blog (Admin)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('admin/posts')
  createPost(
    @Body() dto: CreateBlogPostDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.blogService.createPost(dto, req.user.userId);
  }

  @Get('admin/posts')
  findAllPosts(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.blogService.findAllPostsAdmin(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get('admin/posts/:id')
  findOnePost(@Param('id') id: string) {
    return this.blogService.findOnePostAdmin(id);
  }

  @Patch('admin/posts/:id')
  updatePost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.updatePost(id, dto);
  }

  @Delete('admin/posts/:id')
  removePost(@Param('id') id: string) {
    return this.blogService.removePost(id);
  }
}
