import type { OrgEvent, DayGroup } from '@/types';

// Helper to create dates relative to today
const getDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const formatDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const todayDate = formatDate(0);
export const tomorrowDate = formatDate(1);

// All events are student organization events ONLY
export const events: OrgEvent[] = [
  // Today's events
  {
    id: '1',
    title: 'General Body Meeting',
    startTime: '6:00 PM',
    endTime: '7:30 PM',
    location: 'Student Center South 256',
    category: 'Meeting',
    organization: 'Society of Hispanic Professional Engineers',
    orgShortName: 'SHPE',
    description: 'Weekly GBM with updates on upcoming events, industry speakers, and networking opportunities. Pizza provided!',
    date: getDate(0),
  },
  {
    id: '2',
    title: 'Bake Sale Fundraiser',
    startTime: '11:00 AM',
    endTime: '3:00 PM',
    location: 'Lynn Eusan Park',
    category: 'Fundraiser',
    organization: 'Pre-Medical Society',
    orgShortName: 'PMS',
    description: 'Homemade cookies, brownies, and cupcakes. All proceeds go to our medical mission trip.',
    date: getDate(0),
  },
  {
    id: '3',
    title: 'Salsa Night Social',
    startTime: '8:00 PM',
    endTime: '11:00 PM',
    location: 'Student Center South Ballroom',
    category: 'Social',
    organization: 'Salsa Club',
    orgShortName: 'Salsa',
    description: 'Weekly social with beginner lessons at 8pm. No partner or experience needed!',
    date: getDate(0),
  },
  {
    id: '4',
    title: 'Community Cleanup',
    startTime: '9:00 AM',
    endTime: '12:00 PM',
    location: 'Third Ward Community Garden',
    category: 'Service',
    organization: 'Habitat for Humanity Campus Chapter',
    orgShortName: 'Habitat',
    description: 'Join us for our monthly community service project. Gloves and tools provided.',
    date: getDate(0),
  },
  
  // Tomorrow's events
  {
    id: '5',
    title: 'Diwali Celebration',
    startTime: '7:00 PM',
    endTime: '10:00 PM',
    location: 'Cullen Performance Hall',
    category: 'Cultural',
    organization: 'Indian Student Association',
    orgShortName: 'ISA',
    description: 'Annual Diwali celebration with performances, food, and fireworks. Open to all!',
    date: getDate(1),
  },
  {
    id: '6',
    title: 'Chapter Meeting',
    startTime: '7:00 PM',
    endTime: '8:30 PM',
    location: 'M.D. Anderson Library 106',
    category: 'Meeting',
    organization: 'Alpha Kappa Psi',
    orgShortName: 'AKPsi',
    description: 'Professional development meeting with resume workshop and networking.',
    date: getDate(1),
  },
  {
    id: '7',
    title: 'Trivia Night Fundraiser',
    startTime: '6:00 PM',
    endTime: '9:00 PM',
    location: 'The Den',
    category: 'Fundraiser',
    organization: 'Engineering Student Council',
    orgShortName: 'ESC',
    description: 'Test your knowledge and win prizes! $5 entry, proceeds support engineering scholarships.',
    date: getDate(1),
  },
  
  // Day after tomorrow
  {
    id: '8',
    title: 'Lunar New Year Festival',
    startTime: '5:00 PM',
    endTime: '9:00 PM',
    location: 'Student Center North Lobby',
    category: 'Cultural',
    organization: 'Chinese Student Association',
    orgShortName: 'CSA',
    description: 'Celebrate Lunar New Year with traditional food, performances, and red envelope giveaways.',
    date: getDate(2),
  },
  {
    id: '9',
    title: 'Rush Event: Game Night',
    startTime: '8:00 PM',
    endTime: '11:00 PM',
    location: 'Sigma Chi House',
    category: 'Greek',
    organization: 'Sigma Chi',
    orgShortName: 'ΣΧ',
    description: 'Casual game night during rush week. Meet the brothers and have fun!',
    date: getDate(2),
  },
  
  // Later in the week
  {
    id: '10',
    title: 'Org Fair Prep Meeting',
    startTime: '5:00 PM',
    endTime: '6:30 PM',
    location: 'Student Center South 238',
    category: 'Meeting',
    organization: 'Student Government Association',
    orgShortName: 'SGA',
    description: 'Planning meeting for the upcoming student org fair. All orgs welcome.',
    date: getDate(3),
  },
  {
    id: '11',
    title: 'Karaoke Night',
    startTime: '7:00 PM',
    endTime: '10:00 PM',
    location: 'Student Center South Game Room',
    category: 'Social',
    organization: 'Korean Student Association',
    orgShortName: 'KSA',
    description: 'Sing your heart out! Free snacks and drinks provided.',
    date: getDate(3),
  },
  {
    id: '12',
    title: 'Blood Drive',
    startTime: '10:00 AM',
    endTime: '4:00 PM',
    location: 'Student Center North Plaza',
    category: 'Service',
    organization: 'Red Cross Club',
    orgShortName: 'RCC',
    description: 'Donate blood and save lives. Walk-ins welcome, appointments preferred.',
    date: getDate(4),
  },
  {
    id: '13',
    title: 'Speed Friending',
    startTime: '6:00 PM',
    endTime: '8:00 PM',
    location: 'Student Center South 256',
    category: 'Social',
    organization: 'International Student Organization',
    orgShortName: 'ISO',
    description: 'Meet new people in a fun, low-pressure environment. Ice cream social after!',
    date: getDate(4),
  },
  {
    id: '14',
    title: 'Philanthropy Week: Pie a President',
    startTime: '12:00 PM',
    endTime: '3:00 PM',
    location: 'Lynn Eusan Park',
    category: 'Fundraiser',
    organization: 'Delta Gamma',
    orgShortName: 'ΔΓ',
    description: 'Pie your favorite org president for charity! $3 per pie.',
    date: getDate(5),
  },
  {
    id: '15',
    title: 'Cultural Showcase',
    startTime: '6:00 PM',
    endTime: '9:00 PM',
    location: 'Cullen Performance Hall',
    category: 'Cultural',
    organization: 'African Student Association',
    orgShortName: 'ASA',
    description: 'Annual showcase featuring dance, music, fashion, and food from across Africa.',
    date: getDate(6),
  },
  {
    id: '16',
    title: 'Bid Day Celebration',
    startTime: '2:00 PM',
    endTime: '6:00 PM',
    location: 'Greek Life Village',
    category: 'Greek',
    organization: 'Panhellenic Council',
    orgShortName: 'PHC',
    description: 'Bid day celebrations for all sororities. Come welcome our new members!',
    date: getDate(6),
  },
  {
    id: '17',
    title: 'Beach Cleanup',
    startTime: '8:00 AM',
    endTime: '12:00 PM',
    location: 'Galveston Beach (Meet at Student Center)',
    category: 'Service',
    organization: 'Environmental Action Coalition',
    orgShortName: 'EAC',
    description: 'Monthly beach cleanup trip. Transportation provided, breakfast included.',
    date: getDate(7),
  },
  {
    id: '18',
    title: 'End of Semester Banquet',
    startTime: '7:00 PM',
    endTime: '11:00 PM',
    location: 'Hilton University of Houston',
    category: 'Social',
    organization: 'National Society of Black Engineers',
    orgShortName: 'NSBE',
    description: 'Semester celebration dinner. Awards, recognition, and good food!',
    date: getDate(7),
  },
];

export const getEventsForDate = (date: string): OrgEvent[] => {
  return events
    .filter(event => event.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
};

export const getDayGroups = (): DayGroup[] => {
  const groups: Map<string, OrgEvent[]> = new Map();
  
  events.forEach(event => {
    if (!groups.has(event.date)) {
      groups.set(event.date, []);
    }
    groups.get(event.date)!.push(event);
  });
  
  const sortedDates = Array.from(groups.keys()).sort();
  
  return sortedDates.map((date, index) => {
    let label: string;
    if (index === 0) label = 'Today';
    else if (index === 1) label = 'Tomorrow';
    else {
      const d = new Date(date);
      label = d.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    return {
      date,
      label,
      events: groups.get(date)!.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    };
  });
};

export const getTodayEvents = (): OrgEvent[] => {
  return getEventsForDate(getDate(0));
};

export const getDatesWithEvents = (): string[] => {
  const dates = new Set(events.map(e => e.date));
  return Array.from(dates).sort();
};

export const getFeaturedEvent = (): OrgEvent => {
  return events[4]; // Diwali Celebration
};
