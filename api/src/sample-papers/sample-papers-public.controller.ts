import { Controller, Get, Headers, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OptionalJwtGuard } from 'src/auth/optional-jwt.guard';
import { SamplePapersService } from './sample-papers.service';

interface RequestWithOptionalUser {
  user?: { userId: string } | null;
}

@ApiTags('Sample Papers (Public)')
@UseGuards(OptionalJwtGuard)
@Controller('sample-papers')
export class SamplePapersPublicController {
  constructor(private readonly samplePapersService: SamplePapersService) {}

  @Get('list')
  findAll() {
    return this.samplePapersService.findAllPapers();
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
