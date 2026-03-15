import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesPublicController } from './notes-public.controller';
import { NotesAdminController } from './notes-admin.controller';
import { SubjectsModule } from '../subjects/subjects.module';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports: [SubjectsModule, TopicsModule],
  controllers: [NotesPublicController, NotesAdminController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
