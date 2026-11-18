import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { user } from '@/db/schema';

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error('ADMIN_EMAIL is required');

  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (existing) {
    await db.update(user).set({ role: 'admin', emailVerified: true }).where(eq(user.id, existing.id));
    console.log(JSON.stringify({ status: 'promoted', email }));
    return;
  }

  const password = `Gk!${randomBytes(12).toString('base64url')}9a`;
  const result = await auth.api.signUpEmail({ body: { email, password, name: 'GeoKenistik Admin' } });
  await db.update(user).set({ role: 'admin', requestedRole: 'student', teacherStatus: 'not_requested', emailVerified: true }).where(eq(user.id, result.user.id));
  console.log(JSON.stringify({ status: 'created', email, temporaryPassword: password }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
