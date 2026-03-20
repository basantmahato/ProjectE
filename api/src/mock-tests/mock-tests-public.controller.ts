import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TestsService } from '../tests/tests.service';
import { ApiTags } from '@nestjs/swagger';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Mock Tests')
@Public()
@UseGuards(OptionalJwtGuard)
@Controller('mock-tests')
export class MockTestsPublicController {
  constructor(private readonly testsService: TestsService) {}

  @Get('published')
  findPublished() {
    return this.testsService.findPublishedMocks();
  }

  @Get('published/slug/:slug')
  findOnePublishedBySlug(@Param('slug') slug: string) {
    return this.testsService.findOnePublishedMockBySlug(slug);
  }

  @Get('published/:id')
  findOnePublished(@Param('id') id: string) {
    return this.testsService.findOnePublishedMock(id);
  }
}
