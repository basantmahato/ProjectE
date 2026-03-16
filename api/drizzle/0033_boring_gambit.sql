CREATE INDEX "idx_answers_attempt_id" ON "answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_answers_question_id" ON "answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_answers_attempt_question" ON "answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "idx_blog_comments_post_id" ON "blog_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_blog_comment_replies_comment_id" ON "blog_comment_replies" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_question_options_question_id" ON "question_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_tests_published_mock" ON "tests" USING btree ("is_published","is_mock");--> statement-breakpoint
CREATE INDEX "idx_tests_scheduled_at" ON "tests" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_test_attempts_user_id" ON "test_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_test_attempts_test_id" ON "test_attempts" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "idx_test_attempts_user_started" ON "test_attempts" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "idx_test_attempts_device_started" ON "test_attempts" USING btree ("device_id","started_at");--> statement-breakpoint
CREATE INDEX "idx_test_questions_test_id" ON "test_questions" USING btree ("test_id");