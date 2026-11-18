import { relations, sql } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  image: text('image'),
  role: text('role', { enum: ['admin', 'teacher', 'student'] }).notNull().default('student'),
  requestedRole: text('requested_role', { enum: ['student', 'teacher'] }).notNull().default('student'),
  teacherStatus: text('teacher_status', { enum: ['not_requested', 'pending', 'approved', 'rejected'] }).notNull().default('not_requested'),
  banned: boolean('banned').notNull().default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(), expiresAt: timestamp('expires_at').notNull(), token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(), updatedAt: timestamp('updated_at').notNull(), ipAddress: text('ip_address'),
  userAgent: text('user_agent'), userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
});
export const account = pgTable('account', {
  id: text('id').primaryKey(), accountId: text('account_id').notNull(), providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }), accessToken: text('access_token'),
  refreshToken: text('refresh_token'), idToken: text('id_token'), accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'), scope: text('scope'), password: text('password'),
  createdAt: timestamp('created_at').notNull(), updatedAt: timestamp('updated_at').notNull(),
});
export const verification = pgTable('verification', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(), createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()),
});

export const mediaAssets = pgTable('media_assets', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  storageProvider: text('storage_provider', { enum: ['r2', 'youtube', 'external'] }).notNull(),
  objectKey: text('object_key'), publicUrl: text('public_url').notNull(), fileName: text('file_name'),
  mimeType: text('mime_type'), fileSize: integer('file_size'), uploadedBy: text('uploaded_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
});

export const courses = pgTable('courses', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`), title: text('title').notNull(), slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''), grade: integer('grade').notNull().default(10), language: text('language').notNull().default('kk'),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  teacherId: text('teacher_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  coverMediaId: text('cover_media_id').references(() => mediaAssets.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(), updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
  publishedAt: timestamp('published_at'),
});
export const courseSections = pgTable('course_sections', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`), courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), position: integer('position').notNull().default(0),
});
export const lessons = pgTable('lessons', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`), sectionId: text('section_id').notNull().references(() => courseSections.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), slug: text('slug').notNull(), summary: text('summary').notNull().default(''),
  content: jsonb('content').notNull().default([]), youtubeUrl: text('youtube_url'), position: integer('position').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false), createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
}, (table) => [uniqueIndex('lesson_section_slug_idx').on(table.sectionId, table.slug)]);
export const assignments = pgTable('assignments', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`), lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), type: text('type', { enum: ['test', 'number', 'text', 'formula', 'file'] }).notNull(),
  prompt: jsonb('prompt').notNull(), settings: jsonb('settings').notNull().default({}), maxScore: integer('max_score').notNull().default(1),
  position: integer('position').notNull().default(0),
});
export const enrollments = pgTable('enrollments', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`), courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => user.id, { onDelete: 'cascade' }), progressPercent: integer('progress_percent').notNull().default(0),
  startedAt: timestamp('started_at').$defaultFn(() => new Date()).notNull(), lastActiveAt: timestamp('last_active_at').$defaultFn(() => new Date()).notNull(), completedAt: timestamp('completed_at'),
}, (table) => [uniqueIndex('enrollment_course_student_idx').on(table.courseId, table.studentId)]);
export const lessonProgress = pgTable('lesson_progress', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`), lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => user.id, { onDelete: 'cascade' }), status: text('status', { enum: ['not_started', 'in_progress', 'completed'] }).notNull().default('not_started'),
  startedAt: timestamp('started_at'), completedAt: timestamp('completed_at'), lastActiveAt: timestamp('last_active_at').$defaultFn(() => new Date()).notNull(),
}, (table) => [uniqueIndex('progress_lesson_student_idx').on(table.lessonId, table.studentId)]);
export const submissions = pgTable('submissions', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`), assignmentId: text('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => user.id, { onDelete: 'cascade' }), answer: jsonb('answer').notNull(),
  status: text('status', { enum: ['submitted', 'checked', 'revision'] }).notNull().default('submitted'), score: integer('score'),
  feedback: text('feedback'), submittedAt: timestamp('submitted_at').$defaultFn(() => new Date()).notNull(), checkedAt: timestamp('checked_at'),
});

export const courseRelations = relations(courses, ({ one, many }) => ({ teacher: one(user, { fields: [courses.teacherId], references: [user.id] }), sections: many(courseSections), enrollments: many(enrollments) }));
export const sectionRelations = relations(courseSections, ({ one, many }) => ({ course: one(courses, { fields: [courseSections.courseId], references: [courses.id] }), lessons: many(lessons) }));
export const lessonRelations = relations(lessons, ({ one, many }) => ({ section: one(courseSections, { fields: [lessons.sectionId], references: [courseSections.id] }), assignments: many(assignments) }));

export const schema = { user, session, account, verification, mediaAssets, courses, courseSections, lessons, assignments, enrollments, lessonProgress, submissions, courseRelations, sectionRelations, lessonRelations };
