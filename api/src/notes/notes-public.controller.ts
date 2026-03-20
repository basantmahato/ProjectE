import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { NotesService } from './notes.service';
import { SubjectsService } from '../subjects/subjects.service';
import { TopicsService } from '../topics/topics.service';

@ApiTags('Notes (Public)')
@Public()
@Controller('notes')
export class NotesPublicController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly topicsService: TopicsService,
    private readonly notesService: NotesService,
  ) {}

  @Get('subjects')
  findAllSubjects() {
    return this.subjectsService.findAll();
  }

  @Get('subjects/slug/:slug')
  findSubjectBySlug(@Param('slug') slug: string) {
    return this.subjectsService.findOneBySlug(slug);
  }

  @Get('subjects/slug/:subjectSlug/topics')
  findTopicsBySubjectSlug(@Param('subjectSlug') subjectSlug: string) {
    return this.subjectsService.findOneBySlug(subjectSlug).then((subject) =>
      this.topicsService.findBySubjectId(subject.id),
    );
  }

  @Get('subjects/slug/:subjectSlug/topics/slug/:topicSlug')
  findTopicBySlugs(
    @Param('subjectSlug') subjectSlug: string,
    @Param('topicSlug') topicSlug: string,
  ) {
    return this.topicsService.findOneBySubjectSlugAndTopicSlug(subjectSlug, topicSlug);
  }

  @Get('subjects/slug/:subjectSlug/topics/slug/:topicSlug/notes')
  findNotesBySubjectAndTopicSlugs(
    @Param('subjectSlug') subjectSlug: string,
    @Param('topicSlug') topicSlug: string,
  ) {
    return this.topicsService
      .findOneBySubjectSlugAndTopicSlug(subjectSlug, topicSlug)
      .then((topic) => this.notesService.findAllNotesByTopicId(topic.id));
  }

  @Get('subjects/:subjectId/topics')
  findTopicsBySubjectId(@Param('subjectId') subjectId: string) {
    return this.topicsService.findBySubjectId(subjectId);
  }

  @Get('topics/:topicId/notes')
  findNotesByTopicId(@Param('topicId') topicId: string) {
    return this.notesService.findAllNotesByTopicId(topicId);
  }

  @Get('notes/slug/:slug')
  findOneNoteBySlug(@Param('slug') slug: string) {
    return this.notesService.findOneNoteBySlug(slug);
  }

  @Get('notes/:noteId')
  findOneNote(@Param('noteId') noteId: string) {
    return this.notesService.findOneNote(noteId);
  }
}
