CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"prompt" jsonb NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"max_score" integer DEFAULT 1 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_sections" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"grade" integer DEFAULT 10 NOT NULL,
	"language" text DEFAULT 'kk' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"teacher_id" text NOT NULL,
	"cover_media_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" text NOT NULL,
	"student_id" text NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp NOT NULL,
	"last_active_at" timestamp NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" text NOT NULL,
	"student_id" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_active_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"content" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"youtube_url" text,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_provider" text NOT NULL,
	"object_key" text,
	"public_url" text NOT NULL,
	"file_name" text,
	"mime_type" text,
	"file_size" integer,
	"uploaded_by" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" text NOT NULL,
	"student_id" text NOT NULL,
	"answer" jsonb NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"score" integer,
	"feedback" text,
	"submitted_at" timestamp NOT NULL,
	"checked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"role" text DEFAULT 'student' NOT NULL,
	"requested_role" text DEFAULT 'student' NOT NULL,
	"teacher_status" text DEFAULT 'not_requested' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_sections" ADD CONSTRAINT "course_sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_section_id_course_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."course_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "enrollment_course_student_idx" ON "enrollments" USING btree ("course_id","student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_lesson_student_idx" ON "lesson_progress" USING btree ("lesson_id","student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_section_slug_idx" ON "lessons" USING btree ("section_id","slug");