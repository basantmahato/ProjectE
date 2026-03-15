CREATE TABLE "user_notification_read" (
	"user_id" uuid NOT NULL,
	"notification_id" uuid NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_notification_read" ADD CONSTRAINT "user_notification_read_user_id_notification_id_pk" PRIMARY KEY("user_id","notification_id");
--> statement-breakpoint
ALTER TABLE "user_notification_read" ADD CONSTRAINT "user_notification_read_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_notification_read" ADD CONSTRAINT "user_notification_read_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
