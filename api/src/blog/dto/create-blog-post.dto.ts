import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogPostDto {
  @ApiPropertyOptional({ description: 'URL-friendly slug (unique). If omitted, derived from title.', example: 'how-to-prepare-for-exams' })
  slug?: string;

  @ApiProperty({ description: 'Post title', example: 'How to Prepare for Exams' })
  title: string;

  @ApiProperty({ description: 'Post content (HTML or markdown)' })
  content: string;

  @ApiPropertyOptional({ description: 'Short excerpt for listings' })
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  featuredImage?: string;

  @ApiPropertyOptional({ description: 'List of image URLs in post', type: [String] })
  images?: string[];

  @ApiPropertyOptional({ description: 'Meta title for SEO' })
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta description for SEO' })
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Meta keywords for SEO', type: [String] })
  metaKeywords?: string[];

  @ApiPropertyOptional({ description: 'Canonical URL' })
  canonicalUrl?: string;

  @ApiPropertyOptional({ description: 'Open Graph title' })
  ogTitle?: string;

  @ApiPropertyOptional({ description: 'Open Graph description' })
  ogDescription?: string;

  @ApiPropertyOptional({ description: 'Open Graph image URL' })
  ogImage?: string;

  @ApiPropertyOptional({ description: 'Twitter card type' })
  twitterCard?: string;

  @ApiPropertyOptional({ description: 'Twitter title' })
  twitterTitle?: string;

  @ApiPropertyOptional({ description: 'Twitter description' })
  twitterDescription?: string;

  @ApiPropertyOptional({ description: 'Twitter image URL' })
  twitterImage?: string;

  @ApiPropertyOptional({ description: 'Publish immediately', default: false })
  isPublished?: boolean;
}
