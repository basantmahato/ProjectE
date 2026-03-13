import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogPublicController } from './blog-public.controller';
import { BlogController } from './blog.controller';

@Module({
  controllers: [BlogPublicController, BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
