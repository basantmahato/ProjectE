import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
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
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(id, dto);
  }

  @ApiTags('Subjects')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}