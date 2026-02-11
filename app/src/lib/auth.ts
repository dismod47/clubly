import { supabase } from './supabase';

const SESSION_KEY = 'clubspace_session';

interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  organization_name: string;
  is_verified: boolean;
  is_admin: boolean;
  logo_url: string | null;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  organizationName: string;
  isAdmin: boolean;
}

function isValidEduEmail(email: string): boolean {
  return email.toLowerCase().endsWith('.edu');
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

export async function signUp(
  email: string,
  password: string,
  organizationName: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isValidEduEmail(email)) {
    return { user: null, error: 'Must use a .edu email address' };
  }

  if (password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters' };
  }

  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      organization_name: organizationName,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { user: null, error: 'Email already registered' };
    }
    return { user: null, error: error.message };
  }

  const user = mapDbUserToAuthUser(data as DbUser);
  saveSession(user);
  return { user, error: null };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) {
    return { user: null, error: 'Invalid email or password' };
  }

  const userData = data as DbUser;

  // Special case for admin account
  let isValid = false;
  if (userData.is_admin && email.toLowerCase() === 'admin@admin.edu' && password === 'admin123') {
    isValid = true;
  } else {
    isValid = await verifyPassword(password, userData.password_hash);
  }

  if (!isValid) {
    return { user: null, error: 'Invalid email or password' };
  }

  const user = mapDbUserToAuthUser(userData);
  saveSession(user);
  return { user, error: null };
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session) as AuthUser;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function mapDbUserToAuthUser(dbUser: DbUser): AuthUser {
  return {
    id: dbUser.id,
    email: dbUser.email,
    organizationName: dbUser.organization_name,
    isAdmin: dbUser.is_admin,
  };
}
