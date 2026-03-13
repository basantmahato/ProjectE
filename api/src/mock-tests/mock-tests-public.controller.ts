import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TestsService } from '../tests/tests.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.gaurd';

@ApiTags('Mock Tests')
@UseGuards(JwtAuthGuard)
@Controller('mock-tests')
export class MockTestsPublicController {
  constructor(private readonly testsService: TestsService) {}

  @Get('published')
  findPublished() {
    return this.testsService.findPublishedMocks();
  }

  @Get('published/:id')
  findOnePublished(@Param('id') id: string) {
    return this.testsService.findOnePublishedMock(id);
  }
}
