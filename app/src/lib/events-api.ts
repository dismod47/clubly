import { supabase } from './supabase';
import type { OrgEvent, EventCategory } from '@/types';

export interface CreateEventInput {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  category?: EventCategory;
  customCategory?: string;
  orgId?: string | null;
  orgName?: string;
  logoUrl?: string | null;
}

interface DbEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string;
  category: string;
  custom_category: string | null;
  org_id: string | null;
  logo_url: string | null;
  is_approved: boolean;
  created_at: string;
}

function mapDbEventToOrgEvent(dbEvent: DbEvent, orgName: string): OrgEvent {
  const startDate = new Date(dbEvent.start_time);
  return {
    id: dbEvent.id,
    title: dbEvent.title || 'Untitled Event',
    description: dbEvent.description || '',
    startTime: startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    endTime: new Date(dbEvent.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    location: dbEvent.location || 'TBD',
    category: (dbEvent.category as EventCategory) || 'Other',
    customCategory: dbEvent.custom_category || undefined,
    organization: orgName,
    orgShortName: orgName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 5),
    date: startDate.toISOString().split('T')[0],
    logoUrl: dbEvent.logo_url || undefined,
    orgId: dbEvent.org_id || undefined,
  };
}

export async function fetchEvents(): Promise<OrgEvent[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      users:org_id (organization_name, logo_url)
    `)
    .eq('is_approved', true)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return events.map((event: DbEvent & { users?: { organization_name: string; logo_url: string | null } | null }) => {
    const userData = event.users;
    const orgName = userData?.organization_name || 'Unknown Org';
    const mapped = mapDbEventToOrgEvent(event, orgName);
    if (userData?.logo_url) {
      mapped.logoUrl = userData.logo_url;
    }
    return mapped;
  });
}

export async function fetchEventsBySchool(schoolId: string): Promise<OrgEvent[]> {
  // Get events where the org belongs to this school
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      users:org_id (organization_name, logo_url, school_id)
    `)
    .eq('is_approved', true)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  // Filter events by school
  const schoolEvents = events.filter((event: DbEvent & { users?: { organization_name: string; logo_url: string | null; school_id: string | null } | null }) => {
    return event.users?.school_id === schoolId;
  });

  return schoolEvents.map((event: DbEvent & { users?: { organization_name: string; logo_url: string | null; school_id: string | null } | null }) => {
    const userData = event.users;
    const orgName = userData?.organization_name || 'Unknown Org';
    const mapped = mapDbEventToOrgEvent(event, orgName);
    if (userData?.logo_url) {
      mapped.logoUrl = userData.logo_url;
    }
    return mapped;
  });
}

export async function createEvent(input: CreateEventInput): Promise<{ event: OrgEvent | null; error: string | null }> {
  const now = new Date();
  const defaultEnd = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later

  const { data, error } = await supabase
    .from('events')
    .insert({
      title: input.title || 'Untitled Event',
      description: input.description || '',
      start_time: input.startTime?.toISOString() || now.toISOString(),
      end_time: input.endTime?.toISOString() || defaultEnd.toISOString(),
      location: input.location || 'TBD',
      category: input.category || 'Other',
      custom_category: input.customCategory || null,
      org_id: input.orgId || null,
      logo_url: input.logoUrl || null,
    })
    .select()
    .single();

  if (error) {
    return { event: null, error: error.message };
  }

  let orgName = input.orgName || 'Unknown Org';
  if (input.orgId) {
    const { data: user } = await supabase
      .from('users')
      .select('organization_name')
      .eq('id', input.orgId)
      .single();
    if (user) orgName = user.organization_name;
  }

  return {
    event: mapDbEventToOrgEvent(data, orgName),
    error: null,
  };
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  category?: EventCategory;
  customCategory?: string;
}

export async function updateEvent(
  eventId: string,
  userId: string,
  isAdmin: boolean,
  input: UpdateEventInput
): Promise<{ event: OrgEvent | null; error: string | null }> {
  const updateData: Record<string, unknown> = {};
  
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.startTime !== undefined) updateData.start_time = input.startTime.toISOString();
  if (input.endTime !== undefined) updateData.end_time = input.endTime.toISOString();
  if (input.location !== undefined) updateData.location = input.location;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.customCategory !== undefined) updateData.custom_category = input.customCategory;

  let query = supabase.from('events').update(updateData).eq('id', eventId);

  if (!isAdmin) {
    query = query.eq('org_id', userId);
  }

  const { data, error } = await query.select().single();

  if (error) {
    return { event: null, error: error.message };
  }

  // Get org name
  let orgName = 'Unknown Org';
  if (data.org_id) {
    const { data: userData } = await supabase
      .from('users')
      .select('organization_name')
      .eq('id', data.org_id)
      .single();
    if (userData) orgName = userData.organization_name;
  }

  return {
    event: mapDbEventToOrgEvent(data, orgName),
    error: null,
  };
}

export async function deleteEvent(eventId: string, userId: string, isAdmin: boolean): Promise<{ error: string | null }> {
  let query = supabase.from('events').delete().eq('id', eventId);

  if (!isAdmin) {
    query = query.eq('org_id', userId);
  }

  const { error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function uploadLogo(file: File): Promise<{ url: string | null; error: string | null }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `logos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(filePath, file);

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from('logos').getPublicUrl(filePath);

  return { url: data.publicUrl, error: null };
}
