import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { EventCard } from '@/components/events/EventCard';
import { EventDetail } from '@/components/events/EventDetail';
import { ClubSpaceLogo } from '@/components/ClubSpaceLogo';
import { useAuth } from '@/hooks/useAuth';
import { fetchEventsBySchool } from '@/lib/events-api';
import { supabase } from '@/lib/supabase';
import type { OrgEvent } from '@/types';
import { categoryEmojis, categoryColors } from '@/types';
import { ChevronLeft, ChevronRight, ArrowLeft, Sparkles, Calendar } from 'lucide-react';

interface School {
  id: string;
  name: string;
  slug: string;
  location: string;
  color: string | null;
}

export function MonthlyCalendarPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<OrgEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch school data
  useEffect(() => {
    async function fetchSchool() {
      if (!slug) return;

      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        navigate('/');
        return;
      }

      setSchool(data as School);
      setLoading(false);
    }

    fetchSchool();
  }, [slug, navigate]);

  const loadEvents = useCallback(async () => {
    if (!school) return;
    const data = await fetchEventsBySchool(school.id);
    setEvents(data);
  }, [school]);

  useEffect(() => {
    if (school) {
      loadEvents();
    }
  }, [school, loadEvents]);

  // Get current month based on offset
  const currentMonth = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    return date;
  }, [monthOffset]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate days for the month grid
  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Day of week for first day (0 = Sunday)
    let startDayOfWeek = firstDay.getDay();
    // Adjust to Monday start (0 = Monday)
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Fill remaining cells to complete the grid (up to 42 cells for 6 rows)
    while (days.length < 35) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  const formatDateKey = (date: Date): string => {
    // Use local timezone (not UTC) to match event date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };

  const getEventsForDate = (date: Date): OrgEvent[] => {
    const dateKey = formatDateKey(date);
    return events.filter(e => e.date === dateKey);
  };

  const handleEventClick = (event: OrgEvent) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedEvent(null), 200);
  };

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(e => e.date === selectedDate);
  }, [selectedDate, events]);

  const getSelectedDateLabel = (): string => {
    if (!selectedDate) return '';
    // Parse date string as local date (add T12:00 to avoid timezone issues)
    const date = new Date(selectedDate + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getIntensityLevel = (eventCount: number): number => {
    if (eventCount === 0) return 0;
    if (eventCount === 1) return 1;
    if (eventCount === 2) return 2;
    if (eventCount <= 4) return 3;
    return 4;
  };

  const intensityGradients = [
    'from-gray-50 to-white',
    'from-slate-50 to-white',
    'from-purple-50/80 to-pink-50/80',
    'from-orange-50 via-pink-50 to-purple-50',
    'from-orange-100 via-pink-100 to-purple-100',
  ];

  if (loading || !school) {
    return (
      <div className="min-h-screen bg-[#F6F6F2] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#F6F6F2] via-white to-[#F0F7FF]">
      <div className="grain-overlay" />

      {/* Header */}
      <header className="flex-shrink-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ClubSpaceLogo />
            <div className="hidden md:flex items-center gap-2">
              <div
                className="h-8 w-1 rounded-full"
                style={{ backgroundColor: school.color || '#FF6B35' }}
              />
              <span className="text-lg font-bold text-[#111]">{school.name}</span>
            </div>
          </div>
          <Link
            to={`/${slug}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-uh-purple/10 to-uh-teal/10 text-sm font-medium text-uh-purple hover:from-uh-purple/20 hover:to-uh-teal/20 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </header>

      {/* Month Navigation */}
      <div className="flex-shrink-0 px-6 lg:px-10 py-4 bg-white/50 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMonthOffset(prev => prev - 1)}
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <ChevronLeft size={20} className="text-[#111]" />
            </button>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#111] min-w-[200px] text-center">
              {monthName}
            </h2>
            <button
              onClick={() => setMonthOffset(prev => prev + 1)}
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <ChevronRight size={20} className="text-[#111]" />
            </button>
          </div>

          {monthOffset !== 0 && (
            <button
              onClick={() => setMonthOffset(0)}
              className="text-sm text-uh-purple font-medium hover:underline"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-bold text-[#6F6F6F] uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days grid */}
          <div className="flex-1 grid grid-cols-7 gap-1 auto-rows-fr">
            {monthDays.map((date, index) => {
              if (!date) {
                return <div key={index} className="bg-gray-50/50 rounded-lg" />;
              }

              const dateKey = formatDateKey(date);
              const dayEvents = getEventsForDate(date);
              const eventCount = dayEvents.length;
              const intensity = getIntensityLevel(eventCount);
              const today = isToday(date);
              const selected = selectedDate === dateKey;
              const previewEvent = dayEvents[0];
              const uniqueCategories = [...new Set(dayEvents.map(e => e.category))];

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`
                    relative flex flex-col p-2 rounded-lg transition-all duration-200 overflow-hidden
                    ${selected
                      ? 'bg-gradient-to-br from-[#111] to-[#333] text-white shadow-lg ring-2 ring-uh-purple/40 scale-[1.02] z-10'
                      : today
                        ? 'bg-gradient-to-br from-uh-orange via-uh-pink to-uh-purple text-white shadow-md hover:shadow-lg'
                        : eventCount > 0
                          ? `bg-gradient-to-br ${intensityGradients[intensity]} hover:shadow-md border border-gray-100`
                          : 'bg-white/60 hover:bg-white border border-gray-100/50'
                    }
                  `}
                >
                  {/* Date number */}
                  <span className={`text-sm lg:text-base font-bold ${
                    selected || today ? 'text-white' : 'text-[#111]'
                  }`}>
                    {date.getDate()}
                  </span>

                  {/* Today indicator */}
                  {today && !selected && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
                  )}

                  {/* Category dots */}
                  {eventCount > 0 && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {uniqueCategories.slice(0, 3).map((category, i) => (
                        <span
                          key={i}
                          className="w-3 h-3 lg:w-4 lg:h-4 rounded-full flex items-center justify-center text-[6px] lg:text-[8px]"
                          style={{ backgroundColor: selected || today ? 'rgba(255,255,255,0.3)' : categoryColors[category] }}
                        >
                          {categoryEmojis[category]}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Event preview */}
                  {previewEvent && (
                    <p className={`text-[8px] lg:text-[10px] truncate mt-auto ${
                      selected || today ? 'text-white/80' : 'text-[#6F6F6F]'
                    }`}>
                      {previewEvent.title}
                    </p>
                  )}

                  {/* Event count */}
                  {eventCount > 1 && (
                    <span className={`text-[8px] lg:text-[10px] font-bold ${
                      selected || today ? 'text-white/70' : 'text-uh-purple'
                    }`}>
                      +{eventCount - 1} more
                    </span>
                  )}

                  {/* Busy indicator */}
                  {intensity >= 3 && !selected && !today && (
                    <Sparkles className="absolute top-1 right-1 w-3 h-3 text-uh-orange" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Events Panel */}
        {selectedDate && (
          <div className="w-80 lg:w-96 flex-shrink-0 border-l border-gray-200/50 bg-white/80 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#111]">{getSelectedDateLabel()}</h3>
                  <p className="text-sm text-[#6F6F6F]">{selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-[#6F6F6F] hover:text-[#111] px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event)}
                    variant="compact"
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-uh-orange/20 to-uh-pink/20 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-uh-orange" />
                  </div>
                  <p className="text-[#6F6F6F]">No events on this day</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <EventDetail
        event={selectedEvent}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        isAdmin={isAdmin}
        userId={user?.id}
        onEventDeleted={loadEvents}
      />
    </div>
  );
}
