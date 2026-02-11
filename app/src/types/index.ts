export type EventCategory = 'Social' | 'Meeting' | 'Fundraiser' | 'Cultural' | 'Greek' | 'Service' | 'Other';

export interface OrgEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  customCategory?: string;
  organization: string;
  orgShortName: string;
  description: string;
  date: string; // ISO date string
  logoUrl?: string;
  orgId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface DayGroup {
  date: string;
  label: string;
  events: OrgEvent[];
}

export const categoryColors: Record<EventCategory, string> = {
  Social: '#F3E7FF',
  Meeting: '#B9E7F5',
  Fundraiser: '#FFD6A5',
  Cultural: '#FFF6A5',
  Greek: '#D6F5E3',
  Service: '#FFE4E1',
  Other: '#E8E8E8',
};

export const categoryTextColors: Record<EventCategory, string> = {
  Social: '#5C3D7A',
  Meeting: '#0D4F5C',
  Fundraiser: '#8B4513',
  Cultural: '#7A6A00',
  Greek: '#1A5C3A',
  Service: '#8B4513',
  Other: '#4A4A4A',
};

export const categoryEmojis: Record<EventCategory, string> = {
  Social: '🎉',
  Meeting: '📋',
  Fundraiser: '💰',
  Cultural: '🌍',
  Greek: '🏛️',
  Service: '🤝',
  Other: '📌',
};
