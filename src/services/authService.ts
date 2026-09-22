import {
  getCurrentSession,
  getAuthenticatedUser,
  invokeFunction,
  isSupabaseConfigured,
  markPasswordChanged,
  setSession,
  signInWithPassword,
  signOut,
  requestPasswordReset as requestPasswordResetWithSupabase,
  updatePassword,
  updateAuthenticatedUser,
} from '../lib/supabase';
import type { Role, Session } from '../navigationLogic';
import type { ProfileRecord, SupabaseSession } from '../types/database';
import { selectRows, updateRows } from '../lib/supabase';

function roleFromProfile(role: ProfileRecord['role']): Role {
  return role;
}

export function isEmailIdentifier(identifier: string) {
  return identifier.includes('@');
}

async function loadProfile(userId: string) {
  const rows = await selectRows<ProfileRecord>('profiles', { id: `eq.${userId}`, limit: '1' });
  if (!rows[0]) throw new Error('Your account profile has not been created yet. Ask a department administrator to complete it.');
  return rows[0];
}

async function buildSession(authSession: SupabaseSession, mode: Session['mode']): Promise<Session> {
  const profile = await loadProfile(authSession.user.id);
  const lecturerRows = profile.role === 'lecturer_admin'
    ? await selectRows<{ id: string }>('lecturers', { user_id: `eq.${profile.id}`, limit: '1' })
    : [];

  return {
    userId: authSession.user.id,
    email: profile.email || authSession.user.email || '',
    displayName: profile.full_name,
    role: roleFromProfile(profile.role),
    mode,
    lecturerProfileId: lecturerRows[0]?.id,
    mustChangePassword: profile.password_change_required,
  };
}

export async function authenticate(identifier: string, password: string, mode: Session['mode']) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add the required environment variables before logging in.');
  }

  const trimmedIdentifier = identifier.trim();
  const authSession = isEmailIdentifier(trimmedIdentifier)
    ? await signInWithPassword(trimmedIdentifier, password)
    : await invokeFunction<{ session: SupabaseSession; user: SupabaseSession['user'] }>('login-with-computer-id', {
      computer_id: trimmedIdentifier,
      password,
    }).then((result) => {
      const session = result.session;
      if (!session) throw new Error('Computer ID login did not return an authenticated session.');
      return setSession(session);
    });

  return buildSession(authSession, mode);
}

export async function requestPasswordReset(identifier: string) {
  const redirectTo = typeof window === 'undefined' ? '' : `${window.location.origin}${window.location.pathname}`;
  await requestPasswordResetWithSupabase(identifier, redirectTo);
}

export async function completePasswordReset(password: string, accessToken?: string) {
  void accessToken;
  await updatePassword(password);
  await markPasswordChanged();
}

export async function restoreSession() {
  if (!isSupabaseConfigured) return null;
  const currentSession = await getCurrentSession();
  if (!currentSession) return null;
  const user = await getAuthenticatedUser();
  if (!user) return null;
  const profile = await loadProfile(user.id);
  const lecturerRows = profile.role === 'lecturer_admin'
    ? await selectRows<{ id: string }>('lecturers', { user_id: `eq.${profile.id}`, limit: '1' })
    : [];

  return {
    userId: user.id,
    email: profile.email || user.email || '',
    displayName: profile.full_name,
    role: roleFromProfile(profile.role),
    mode: profile.role === 'student' ? 'regular' as const : 'admin' as const,
    lecturerProfileId: lecturerRows[0]?.id,
    mustChangePassword: profile.password_change_required,
  } satisfies Session;
}

export async function updateOwnProfile(values: Partial<ProfileRecord>) {
  const current = await getAuthenticatedUser();
  if (!current) throw new Error('You must be logged in to update your profile.');

  if (values.email && values.email !== current.email) {
    await updateAuthenticatedUser({ email: values.email });
  }

  const profileValues = Object.fromEntries(
    Object.entries({
      full_name: values.full_name,
      email: values.email,
      phone_number: values.phone_number,
      department: values.department,
      office_room: values.office_room,
      profile_image: values.profile_image,
    }).filter(([, value]) => value !== undefined),
  );
  const rows = await updateRows<ProfileRecord>('profiles', { id: `eq.${current.id}` }, profileValues);
  if (!rows[0]) throw new Error('Your profile was not updated.');
  return rows[0];
}

export { signOut };
