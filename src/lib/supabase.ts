import { createClient, type Session as AuthSession, type User as AuthUser } from '@supabase/supabase-js';

import type { SupabaseSession, SupabaseUser } from '../types/database';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const containsPlaceholder = (value: string) => /your[-_ ]?(project|publishable|anon)|YOUR_PROJECT|YOUR_SUPABASE/i.test(value);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey) && !containsPlaceholder(supabaseUrl) && !containsPlaceholder(supabaseAnonKey);

export class SupabaseConfigurationError extends Error {
  constructor(message = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.') {
    super(message);
    this.name = 'SupabaseConfigurationError';
  }
}

export class SupabaseRequestError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'SupabaseRequestError';
    this.status = status;
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

function requireClient() {
  if (!supabase) throw new SupabaseConfigurationError();
  return supabase;
}

function toLegacyUser(user: AuthUser): SupabaseUser {
  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  };
}

function toLegacySession(session: AuthSession): SupabaseSession {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: toLegacyUser(session.user),
  };
}

function getErrorStatus(error: unknown) {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return Number((error as { status?: unknown }).status) || 0;
  }
  return 0;
}

function throwIfError(error: { message?: string; status?: number } | null, fallback: string): never | void {
  if (error) throw new SupabaseRequestError(error.message || fallback, error.status || 0);
}

export async function getCurrentSession() {
  const client = requireClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw new SupabaseRequestError(error.message, getErrorStatus(error));
  return data.session ? toLegacySession(data.session) : null;
}

export async function signInWithPassword(email: string, password: string) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new SupabaseRequestError(error?.message || 'Unable to sign in.', getErrorStatus(error));
  }
  return toLegacySession(data.session);
}

export async function setSession(session: SupabaseSession) {
  const client = requireClient();
  const { data, error } = await client.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (error || !data.session) {
    throw new SupabaseRequestError(error?.message || 'Unable to store the authenticated session.', getErrorStatus(error));
  }
  return toLegacySession(data.session);
}

export async function refreshSession() {
  const client = requireClient();
  const { data, error } = await client.auth.refreshSession();
  if (error || !data.session) return null;
  return toLegacySession(data.session);
}

export async function getAuthenticatedUser(): Promise<SupabaseUser | null> {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return toLegacyUser(data.user);
}

export async function updateAuthenticatedUser(values: { email?: string }) {
  const client = requireClient();
  const { data, error } = await client.auth.updateUser(values);
  if (error || !data.user) {
    throw new SupabaseRequestError(error?.message || 'Unable to update your account.', getErrorStatus(error));
  }
  return toLegacyUser(data.user);
}

export async function updatePassword(password: string) {
  const client = requireClient();
  const { data, error } = await client.auth.updateUser({ password });
  if (error || !data.user) {
    throw new SupabaseRequestError(error?.message || 'Unable to update password.', getErrorStatus(error));
  }
  return toLegacyUser(data.user);
}

export async function requestPasswordReset(identifier: string, redirectTo: string) {
  return invokeFunction<{ message: string }>('request-password-reset', {
    identifier: identifier.trim(),
    redirect_to: redirectTo,
  });
}

export async function markPasswordChanged() {
  const client = requireClient();
  const { error } = await client.rpc('mark_password_changed');
  if (error) throw new SupabaseRequestError(error.message, getErrorStatus(error));
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new SupabaseRequestError(error.message, getErrorStatus(error));
}

export async function invokeFunction<T>(functionName: string, body: unknown) {
  const client = requireClient();
  const { data, error } = await client.functions.invoke<T>(functionName, { body: JSON.stringify(body) });
  if (error) {
    throw new SupabaseRequestError(error.message || 'Supabase function request failed.', getErrorStatus(error));
  }
  return data as T;
}

function applyFilter(query: any, key: string, value: string) {
  const separator = value.indexOf('.');
  const operator = separator === -1 ? 'eq' : value.slice(0, separator);
  const operand = separator === -1 ? value : value.slice(separator + 1);

  switch (operator) {
    case 'eq': return query.eq(key, operand);
    case 'neq': return query.neq(key, operand);
    case 'gt': return query.gt(key, operand);
    case 'gte': return query.gte(key, operand);
    case 'lt': return query.lt(key, operand);
    case 'lte': return query.lte(key, operand);
    case 'ilike': return query.ilike(key, operand);
    case 'is': return query.is(key, operand === 'null' ? null : operand);
    case 'in': return query.in(key, operand.replace(/^\(|\)$/g, '').split(','));
    default: return query;
  }
}

export async function selectRows<T>(table: string, queryOptions: Record<string, string> = {}) {
  const client = requireClient();
  const selection = queryOptions.select || '*';
  let query: any = (client.from(table) as any).select(selection);

  for (const [key, value] of Object.entries(queryOptions)) {
    if (key === 'select') continue;
    if (key === 'limit') {
      query = query.limit(Number(value));
      continue;
    }
    if (key === 'order') {
      for (const item of value.split(',')) {
        const [column, direction] = item.split('.');
        query = query.order(column, { ascending: direction !== 'desc' });
      }
      continue;
    }
    query = applyFilter(query, key, value);
  }

  const { data, error } = await query;
  throwIfError(error, 'Unable to load Supabase records.');
  return (data || []) as T[];
}

export async function countRows(table: string, queryOptions: Record<string, string> = {}) {
  const client = requireClient();
  let query: any = (client.from(table) as any).select('id', { count: 'exact', head: true });
  for (const [key, value] of Object.entries(queryOptions)) query = applyFilter(query, key, value);
  const { count, error } = await query;
  throwIfError(error, 'Unable to count Supabase records.');
  return count || 0;
}

export async function insertRows<T>(table: string, rows: unknown | unknown[]) {
  const client = requireClient();
  const { data, error } = await (client.from(table) as any).insert(rows).select();
  throwIfError(error, 'Unable to save Supabase records.');
  return (data || []) as T[];
}

export async function updateRows<T>(table: string, filter: Record<string, string>, values: unknown) {
  const client = requireClient();
  let query: any = (client.from(table) as any).update(values);
  for (const [key, value] of Object.entries(filter)) query = applyFilter(query, key, value);
  const { data, error } = await query.select();
  throwIfError(error, 'Unable to update Supabase records.');
  return (data || []) as T[];
}

export async function deleteRows(table: string, filter: Record<string, string>) {
  const client = requireClient();
  let query: any = (client.from(table) as any).delete();
  for (const [key, value] of Object.entries(filter)) query = applyFilter(query, key, value);
  const { error } = await query;
  throwIfError(error, 'Unable to delete Supabase records.');
}
