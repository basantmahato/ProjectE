import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TestsService } from './tests.service';
import { ApiTags } from '@nestjs/swagger';
import { OptionalJwtGuard } from 'src/auth/optional-jwt.guard';

@ApiTags('Tests')
@UseGuards(OptionalJwtGuard)
@Controller('tests')
export class TestsPublicController {
  constructor(private readonly testsService: TestsService) {}

  @Get('published')
  findPublished() {
    return this.testsService.findPublished();
  }

  @Get('upcoming')
  findUpcoming() {
    return this.testsService.findUpcoming();
  }

  @Get('published/:id')
  findOnePublished(@Param('id') id: string) {
    return this.testsService.findOnePublished(id);
  }
}
