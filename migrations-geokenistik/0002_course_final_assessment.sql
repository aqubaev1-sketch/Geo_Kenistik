ALTER TABLE "lessons" ADD COLUMN "is_final_assessment" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "pass_score" integer DEFAULT 6 NOT NULL;--> statement-breakpoint
CREATE INDEX "lessons_final_assessment_idx" ON "lessons" USING btree ("is_final_assessment");
