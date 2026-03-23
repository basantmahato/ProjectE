import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateBlogPostDto {
  @ApiPropertyOptional({
    description: 'URL-friendly slug (unique). If omitted, derived from title.',
    example: 'how-to-prepare-for-exams',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Post title',
    example: 'How to Prepare for Exams',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Title is required' })
  title: string;

  @ApiProperty({ description: 'Post content (HTML or markdown)' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Short excerpt for listings' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({
    description: 'List of image URLs in post',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Meta title for SEO' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta description for SEO' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Meta keywords for SEO', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @ApiPropertyOptional({ description: 'Canonical URL' })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({ description: 'Open Graph title' })
  @IsOptional()
  @IsString()
  ogTitle?: string;

  @ApiPropertyOptional({ description: 'Open Graph description' })
  @IsOptional()
  @IsString()
  ogDescription?: string;

  @ApiPropertyOptional({ description: 'Open Graph image URL' })
  @IsOptional()
  @IsString()
  ogImage?: string;

  @ApiPropertyOptional({ description: 'Twitter card type' })
  @IsOptional()
  @IsString()
  twitterCard?: string;

  @ApiPropertyOptional({ description: 'Twitter title' })
  @IsOptional()
  @IsString()
  twitterTitle?: string;

  @ApiPropertyOptional({ description: 'Twitter description' })
  @IsOptional()
  @IsString()
  twitterDescription?: string;

  @ApiPropertyOptional({ description: 'Twitter image URL' })
  @IsOptional()
  @IsString()
  twitterImage?: string;

  @ApiPropertyOptional({ description: 'Publish immediately', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
