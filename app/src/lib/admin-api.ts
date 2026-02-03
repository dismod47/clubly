import { supabase } from './supabase';

export interface School {
  id: string;
  name: string;
  location: string;
  slug: string;
  color: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  email: string;
  organization_name: string;
  is_verified: boolean;
  logo_url: string | null;
  school_id: string | null;
  created_at: string;
  school?: School | null;
}

export interface ActivityLog {
  id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  target_type: string;
  target_id: string;
  target_name: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

const SKIP_WORDS = ['of', 'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for'];

function generateSlug(name: string): string {
  return name
    .split(/\s+/)
    .filter(word => !SKIP_WORDS.includes(word.toLowerCase()))
    .map(word => word.charAt(0).toLowerCase())
    .join('');
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Schools CRUD

export async function fetchSchools(): Promise<{ data: School[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('name');

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as School[], error: null };
}

export async function createSchool(
  name: string,
  location: string,
  slug?: string,
  color?: string
): Promise<{ data: School | null; error: string | null }> {
  const finalSlug = slug || generateSlug(name);

  const { data, error } = await supabase
    .from('schools')
    .insert({
      name,
      location,
      slug: finalSlug,
      color: color || null,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as School, error: null };
}

export async function deleteSchool(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('schools')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

// Organization management

export async function fetchOrganizations(): Promise<{ data: Organization[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      organization_name,
      is_verified,
      logo_url,
      school_id,
      created_at,
      schools (*)
    `)
    .eq('is_admin', false)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const organizations = (data || []).map((org: Record<string, unknown>) => ({
    ...org,
    school: org.schools || null,
  })) as Organization[];

  return { data: organizations, error: null };
}

export async function createOrganization(
  username: string,
  password: string,
  organizationName: string,
  schoolId: string
): Promise<{ data: Organization | null; error: string | null }> {
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: username.toLowerCase(),
      password_hash: passwordHash,
      organization_name: organizationName,
      school_id: schoolId,
      is_admin: false,
      is_verified: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { data: null, error: 'Username already exists' };
    }
    return { data: null, error: error.message };
  }
  return { data: data as Organization, error: null };
}

export async function updateOrganizationCredentials(
  id: string,
  newUsername?: string,
  newPassword?: string
): Promise<{ error: string | null }> {
  const updates: Record<string, string> = {};

  if (newUsername) {
    updates.email = newUsername.toLowerCase();
  }

  if (newPassword) {
    updates.password_hash = await hashPassword(newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return { error: 'No updates provided' };
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { error: 'Username already exists' };
    }
    return { error: error.message };
  }
  return { error: null };
}

export async function deleteOrganization(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

// Activity logging

export async function logActivity(
  action: string,
  actorId: string,
  actorName: string,
  targetType: string,
  targetId: string,
  targetName: string,
  details?: Record<string, unknown>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      action,
      actor_id: actorId,
      actor_name: actorName,
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      details: details || null,
    });

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function fetchActivityLogs(
  limit: number = 50,
  offset: number = 0
): Promise<{ data: ActivityLog[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as ActivityLog[], error: null };
}
