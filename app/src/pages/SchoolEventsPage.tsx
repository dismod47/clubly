import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventCard } from '@/components/events/EventCard';
import { EventDetail } from '@/components/events/EventDetail';
import { WeekCalendar } from '@/components/WeekCalendar';
import { CreateEventModal } from '@/components/events/CreateEventModal';
import { EditEventModal } from '@/components/events/EditEventModal';
import { OrgDashboardModal } from '@/components/auth/OrgDashboardModal';
import { OrgLoginModal } from '@/components/auth/OrgLoginModal';
import { ClubSpaceLogo } from '@/components/ClubSpaceLogo';
import { AnimatedList } from '@/components/AnimatedList';
import { useAuth } from '@/hooks/useAuth';
import { fetchEventsBySchool } from '@/lib/events-api';
import { supabase } from '@/lib/supabase';
import type { OrgEvent } from '@/types';
import { ChevronLeft, ChevronRight, Plus, LogOut, User, Sparkles, Calendar, Zap, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface School {
  id: string;
  name: string;
  slug: string;
  location: string;
  color: string | null;
}

export function SchoolEventsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, login, logout, isAdmin } = useAuth();
  
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  const [todayOffset, setTodayOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedCalendarDate, setExpandedCalendarDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<OrgEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OrgEvent | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const todaySectionRef = useRef<HTMLDivElement>(null);
  const weekSectionRef = useRef<HTMLDivElement>(null);

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

  const getEventsForDate = (date: string): OrgEvent[] => {
    return events
      .filter(event => event.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getDatesWithEvents = (): string[] => {
    const dates = new Set(events.map(e => e.date));
    return Array.from(dates).sort();
  };
  
  const formatLocalDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + todayOffset);
    return formatLocalDateKey(date);
  }, [todayOffset]);
  
  const todayEvents = useMemo(() => {
    return getEventsForDate(todayDate);
  }, [todayDate, events]);

  const getTodayLabel = (): string => {
    if (todayOffset === 0) return 'Today';
    if (todayOffset === 1) return 'Tomorrow';
    const date = new Date(todayDate);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const handlePrevDay = () => setTodayOffset(prev => prev - 1);
  const handleNextDay = () => setTodayOffset(prev => prev + 1);
  
  const handleCalendarDayClick = (date: string) => {
    setExpandedCalendarDate(prev => prev === date ? null : date);
  };
  
  const handleEventClick = (event: OrgEvent) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };
  
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedEvent(null), 200);
  };

  const handleEditEvent = (event: OrgEvent) => {
    setEditingEvent(event);
    setIsEditOpen(true);
  };

  const canEditEvent = (event: OrgEvent): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    return event.orgId === user.id;
  };
  
  const expandedCalendarEvents = useMemo(() => {
    if (!expandedCalendarDate) return [];
    return getEventsForDate(expandedCalendarDate);
  }, [expandedCalendarDate, events]);
  
  const getExpandedLabel = (): string => {
    if (!expandedCalendarDate) return '';
    const today = formatLocalDateKey(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatLocalDateKey(tomorrow);

    if (expandedCalendarDate === today) return 'Today';
    if (expandedCalendarDate === tomorrowStr) return 'Tomorrow';

    // Parse date string as local date (add T12:00 to avoid timezone issues)
    const date = new Date(expandedCalendarDate + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const handleCreateClick = () => {
    if (user) {
      setIsCreateOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  // GSAP animations
  useEffect(() => {
    if (loading || !school) return;

    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.hero-content',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      // Today section
      gsap.fromTo('.today-header',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' }
      );

      // Week section scroll trigger
      if (weekSectionRef.current) {
        gsap.fromTo('.week-section',
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: weekSectionRef.current,
              start: 'top 85%',
            }
          }
        );
      }
    });

    return () => ctx.revert();
  }, [loading, school]);

  if (loading || !school) {
    return (
      <div className="min-h-screen bg-[#F6F6F2] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  
  // Get the currently displayed events (either today or expanded calendar date)
  const displayedEvents = expandedCalendarDate ? expandedCalendarEvents : todayEvents;
  const displayedLabel = expandedCalendarDate ? getExpandedLabel() : getTodayLabel();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#F6F6F2] via-white to-[#F0F7FF]">
      <div className="grain-overlay" />

      {/* Header */}
      <header className="flex-shrink-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between">
          <ClubSpaceLogo />
          <div className="flex items-center gap-3">
            {user && (
              <>
                <button
                  onClick={() => setIsDashboardOpen(true)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-50 to-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  title="Account settings"
                >
                  <User size={16} className="text-uh-purple" />
                </button>
                <button
                  onClick={logout}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  title="Sign out"
                >
                  <LogOut size={16} className="text-[#6F6F6F]" />
                </button>
              </>
            )}
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-uh-orange to-uh-pink text-white font-semibold text-sm shadow-lg shadow-uh-orange/25 hover:shadow-xl hover:scale-105 transition-all duration-300"
              title="Create event"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Post Event</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="flex-shrink-0 relative overflow-hidden py-6 lg:py-8 px-6 lg:px-10"
        style={{
          background: `linear-gradient(135deg, ${school.color || '#FF6B35'} 0%, #8B5CF6 50%, #14B8A6 100%)`
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="hero-content relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium">
                {school.location}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                {events.length} Events
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              {school.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Week Calendar - Horizontal */}
      <div ref={weekSectionRef} className="flex-shrink-0 px-6 lg:px-10 py-4 bg-white/50 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-uh-purple" />
              <h2 className="text-lg font-bold text-[#111]">
                {weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Next Week' : weekOffset === -1 ? 'Last Week' : `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`}
              </h2>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <span className="text-sm text-[#6F6F6F] hidden sm:inline">Click a day to view events</span>
          </div>
          <Link
            to={`/${slug}/calendar`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-uh-purple/10 to-uh-teal/10 text-sm font-medium text-uh-purple hover:from-uh-purple/20 hover:to-uh-teal/20 transition-all duration-200"
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Full Calendar</span>
          </Link>
        </div>

        {/* Week navigation with arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset(prev => Math.max(prev - 1, -4))}
            disabled={weekOffset <= -4}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 ${
              weekOffset <= -4
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white hover:bg-gradient-to-r hover:from-uh-purple/10 hover:to-uh-pink/10 hover:shadow-lg hover:scale-105 text-[#111]'
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex-1">
            <WeekCalendar
              onDayClick={handleCalendarDayClick}
              expandedDate={expandedCalendarDate || todayDate}
              datesWithEvents={getDatesWithEvents()}
              events={events}
              weekOffset={weekOffset}
            />
          </div>

          <button
            onClick={() => setWeekOffset(prev => Math.min(prev + 1, 8))}
            disabled={weekOffset >= 8}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 ${
              weekOffset >= 8
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white hover:bg-gradient-to-r hover:from-uh-purple/10 hover:to-uh-pink/10 hover:shadow-lg hover:scale-105 text-[#111]'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Back to current week button */}
        {weekOffset !== 0 && (
          <button
            onClick={() => setWeekOffset(0)}
            className="mt-3 text-sm text-uh-purple font-medium hover:underline"
          >
            ← Back to current week
          </button>
        )}
      </div>

      {/* Events Section - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Events Header */}
        <div className="flex-shrink-0 px-6 lg:px-10 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-gradient-to-r from-uh-orange/10 to-uh-pink/10 rounded-full p-0.5">
                <button
                  onClick={handlePrevDay}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                >
                  <ChevronLeft size={18} className="text-[#111]" />
                </button>
                <h2 className="text-2xl lg:text-3xl font-bold text-[#111] min-w-[160px] text-center px-4">
                  {displayedLabel}
                </h2>
                <button
                  onClick={handleNextDay}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                >
                  <ChevronRight size={18} className="text-[#111]" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-uh-purple/10 to-uh-pink/10">
              <Zap className="w-5 h-5 text-uh-purple" />
              <span className="text-base font-bold text-[#111]">
                {displayedEvents.length} event{displayedEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Events Grid */}
        <div ref={todaySectionRef} className="flex-1 overflow-y-auto px-6 lg:px-10 py-6">
          {displayedEvents.length > 0 ? (
            <AnimatedList
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              animationKey={expandedCalendarDate || todayDate}
            >
              {displayedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => handleEventClick(event)}
                  variant="default"
                  canEdit={canEditEvent(event)}
                  onEdit={() => handleEditEvent(event)}
                />
              ))}
            </AnimatedList>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-12 px-8 rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-xl max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-uh-orange/20 to-uh-pink/20 flex items-center justify-center mx-auto mb-5">
                  <Calendar className="w-10 h-10 text-uh-orange" />
                </div>
                <p className="text-xl font-bold text-[#111] mb-2">No events scheduled</p>
                <p className="text-[#6F6F6F] mb-6">Be the first to post an event for this day!</p>
                <button
                  onClick={handleCreateClick}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-uh-orange to-uh-pink text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Create Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <EventDetail 
        event={selectedEvent}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        isAdmin={isAdmin}
        userId={user?.id}
        onEventDeleted={loadEvents}
      />

      <OrgLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={login}
        onSuccess={() => {
          setIsLoginOpen(false);
          setIsCreateOpen(true);
        }}
      />

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        user={user}
        schoolId={school.id}
        onEventCreated={loadEvents}
      />

      <EditEventModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingEvent(null);
        }}
        user={user}
        event={editingEvent}
        isAdmin={isAdmin}
        onEventUpdated={loadEvents}
      />

      <OrgDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        user={user}
        onUpdate={() => {}}
      />
    </div>
  );
}
