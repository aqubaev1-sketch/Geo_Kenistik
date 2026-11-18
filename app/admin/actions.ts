'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/drizzle';
import { courses, session, user } from '@/db/schema';
import { requireRole } from '@/lib/authorization';
import { isUserRole } from '@/lib/roles';

async function assertAdmin() {
  return requireRole(['admin']);
}

export async function approveTeacher(userId: string) {
  await assertAdmin();
  await db.update(user).set({ role: 'teacher', requestedRole: 'teacher', teacherStatus: 'approved' }).where(and(eq(user.id, userId), eq(user.teacherStatus, 'pending')));
  await db.delete(session).where(eq(session.userId, userId));
  revalidatePath('/admin');
}

export async function rejectTeacher(userId: string) {
  await assertAdmin();
  await db.update(user).set({ role: 'student', teacherStatus: 'rejected' }).where(and(eq(user.id, userId), eq(user.teacherStatus, 'pending')));
  revalidatePath('/admin');
}

export async function changeUserRole(formData: FormData) {
  const { session: current } = await assertAdmin();
  const userId = String(formData.get('userId') ?? '');
  const role = formData.get('role');
  if (!userId || !isUserRole(role)) throw new Error('Invalid role change');
  if (userId === current.user.id && role !== 'admin') throw new Error('Админ өз рөлін төмендете алмайды');
  await db.update(user).set({ role, teacherStatus: role === 'teacher' ? 'approved' : 'not_requested' }).where(eq(user.id, userId));
  if (userId !== current.user.id) await db.delete(session).where(eq(session.userId, userId));
  revalidatePath('/admin');
}

export async function toggleUserBlock(userId: string, shouldBlock: boolean) {
  const { session: current } = await assertAdmin();
  if (userId === current.user.id) throw new Error('Админ өзін бұғаттай алмайды');
  await db.update(user).set({ banned: shouldBlock, banReason: shouldBlock ? 'Админ бұғаттады' : null, banExpires: null }).where(eq(user.id, userId));
  if (shouldBlock) await db.delete(session).where(eq(session.userId, userId));
  revalidatePath('/admin');
}

export async function changeCourseStatus(formData: FormData) {
  await assertAdmin();
  const courseId = String(formData.get('courseId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!courseId || !['draft', 'published', 'archived'].includes(status)) throw new Error('Invalid course status');
  await db.update(courses).set({ status: status as 'draft' | 'published' | 'archived', publishedAt: status === 'published' ? new Date() : null, updatedAt: new Date() }).where(eq(courses.id, courseId));
  revalidatePath('/admin');
  revalidatePath('/courses');
}
