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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.gaurd';
import { RolesGuard } from '../auth/roles.gaurd';
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
  findAllPosts() {
    return this.blogService.findAllPostsAdmin();
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
