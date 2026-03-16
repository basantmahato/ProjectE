import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { BulkUploadNotesDto } from './dto/bulk-upload-notes.dto';

@ApiTags('Notes (Admin)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
@Controller('notes/admin')
export class NotesAdminController {
  constructor(private readonly notesService: NotesService) {}

  @Post('topics/:topicId/notes')
  createNote(
    @Param('topicId') topicId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.createNote(topicId, dto);
  }

  @Post('bulk')
  bulkCreate(@Body() dto: BulkUploadNotesDto) {
    return this.notesService.bulkCreate(dto);
  }

  @Patch('notes/:noteId')
  updateNote(
    @Param('noteId') noteId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(noteId, dto);
  }

  @Delete('notes/:noteId')
  removeNote(@Param('noteId') noteId: string) {
    return this.notesService.removeNote(noteId);
  }
}
