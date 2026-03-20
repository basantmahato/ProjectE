import { Controller, Get, Headers, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OptionalJwtGuard } from 'src/auth/optional-jwt.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { SamplePapersService } from './sample-papers.service';

interface RequestWithOptionalUser {
  user?: { userId: string } | null;
}

@ApiTags('Sample Papers (Public)')
@Public()
@UseGuards(OptionalJwtGuard)
@Controller('sample-papers')
export class SamplePapersPublicController {
  constructor(private readonly samplePapersService: SamplePapersService) {}

  @Get('list')
  findAll() {
    return this.samplePapersService.findAllPapers();
  }

  @Get('read/slug/:slug')
  async findOneWithFullTreeBySlug(
    @Param('slug') slug: string,
    @Req() req: RequestWithOptionalUser,
    @Headers('x-device-id') deviceId?: string,
  ) {
    const paper = await this.samplePapersService.findOnePaperBySlug(slug);
    return this.samplePapersService.findPaperWithFullTreeForUserOrGuest(
      paper.id,
      req.user?.userId ?? null,
      deviceId ?? null,
    );
  }

  @Get('read/:paperId')
  findOneWithFullTree(
    @Param('paperId') paperId: string,
    @Req() req: RequestWithOptionalUser,
    @Headers('x-device-id') deviceId?: string,
  ) {
    const userId = req.user?.userId ?? null;
    return this.samplePapersService.findPaperWithFullTreeForUserOrGuest(
      paperId,
      userId,
      deviceId ?? null,
    );
  }
}
