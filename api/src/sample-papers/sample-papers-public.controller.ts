import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { SamplePapersService } from './sample-papers.service';

@ApiTags('Sample Papers (Public)')
@UseGuards(JwtAuthGuard)
@Controller('sample-papers')
export class SamplePapersPublicController {
  constructor(private readonly samplePapersService: SamplePapersService) {}

  @Get('list')
  findAll() {
    return this.samplePapersService.findAllPapers();
  }

  @Get('read/:paperId')
  findOneWithFullTree(@Param('paperId') paperId: string) {
    return this.samplePapersService.findPaperWithFullTree(paperId);
  }
}
