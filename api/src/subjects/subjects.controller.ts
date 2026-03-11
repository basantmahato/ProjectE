import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Role } from 'src/auth/decorators/roles.decorator';


@ApiTags('Subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role("admin")
@Controller('subjects')
export class SubjectsController {

  constructor(private readonly subjectsService: SubjectsService) {}
  
  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }

  @ApiTags('Subjects')
  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @ApiTags('Subjects')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @ApiTags('Subjects')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}