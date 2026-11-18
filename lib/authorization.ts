import { auth } from '@/lib/auth';
import type { UserRole } from '@/lib/roles';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireRole(allowed: UserRole[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');
  const role = session.user.role as UserRole;
  if (!allowed.includes(role)) redirect('/profile');
  return { session, role };
}
