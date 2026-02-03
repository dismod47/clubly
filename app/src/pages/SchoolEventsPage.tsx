import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventCard } from '@/components/events/EventCard';
import { EventDetail } from '@/components/events/EventDetail';
import { WeekCalendar } from '@/components/WeekCalendar';
import { CreateEventModal } from '@/components/events/CreateEventModal';
import { EditEventModal } from '@/components/events/EditEventModal';
import { OrgDashboardModal } from '@/components/auth/OrgDashboardModal';
import { OrgLoginModal } from '@/components/auth/OrgLoginModal';
import { ClublyLogo } from '@/components/ClublyLogo';
import { useAuth } from '@/hooks/useAuth';
import { fetchEventsBySchool } from '@/lib/events-api';
import { supabase } from '@/lib/supabase';
import type { OrgEvent } from '@/types';
import { ChevronLeft, ChevronRight, Plus, LogOut, User } from 'lucide-react';

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
  const [expandedCalendarDate, setExpandedCalendarDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<OrgEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OrgEvent | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
  
  const todayDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + todayOffset);
    return date.toISOString().split('T')[0];
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
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (expandedCalendarDate === today) return 'Today';
    if (expandedCalendarDate === tomorrowStr) return 'Tomorrow';
    
    const date = new Date(expandedCalendarDate);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const handleCreateClick = () => {
    if (user) {
      setIsCreateOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  if (loading || !school) {
    return (
      <div className="min-h-screen bg-[#F6F6F2] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#F6F6F2] pb-24">
      <div className="grain-overlay" />
      
      <header className="sticky top-0 z-40 bg-[#F6F6F2]/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="px-4 py-3 flex items-center justify-between max-w-4xl mx-auto">
          <ClublyLogo />
          <div className="flex items-center gap-2">
            {user && (
              <>
                <button 
                  onClick={() => setIsDashboardOpen(true)}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                  title="Account settings"
                >
                  <User size={16} className="text-[#6F6F6F]" />
                </button>
                <button 
                  onClick={logout}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                  title="Sign out"
                >
                  <LogOut size={16} className="text-[#6F6F6F]" />
                </button>
              </>
            )}
            <button 
              onClick={handleCreateClick}
              className="w-9 h-9 rounded-full bg-[#FF6B35] flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              title="Create event"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>
      
      <div 
        className="text-white py-6 px-4"
        style={{ background: `linear-gradient(135deg, ${school.color || '#FF6B35'}, ${school.color || '#FF6B35'}dd)` }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Clubly at {school.name}</h1>
          <p className="text-white/90 text-sm">
            {school.location} • Student organization events
          </p>
        </div>
      </div>
      
      <main className="px-4 py-4 max-w-4xl mx-auto">
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevDay}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all"
              >
                <ChevronLeft size={18} className="text-[#111]" />
              </button>
              <h2 className="text-xl font-bold text-[#111] min-w-[140px] text-center">
                {getTodayLabel()}
              </h2>
              <button 
                onClick={handleNextDay}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all"
              >
                <ChevronRight size={18} className="text-[#111]" />
              </button>
            </div>
            <span className="text-sm text-[#6F6F6F]">
              {todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>
          
          <div className="space-y-3">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <EventCard 
                  key={event.id}
                  event={event}
                  onClick={() => handleEventClick(event)}
                  variant="minimal"
                  canEdit={canEditEvent(event)}
                  onEdit={() => handleEditEvent(event)}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-2xl">
                <p className="text-[15px] text-[#6F6F6F]">No org events</p>
                <p className="text-[13px] text-[#6F6F6F]/70 mt-1">Check another day</p>
              </div>
            )}
          </div>
        </section>
        
        <div className="h-px bg-gray-200 my-6" />
        
        <section>
          <h3 className="text-sm font-semibold text-[#6F6F6F] uppercase tracking-wider mb-3">
            This Week
          </h3>
          
          <WeekCalendar 
            onDayClick={handleCalendarDayClick}
            expandedDate={expandedCalendarDate}
            datesWithEvents={getDatesWithEvents()}
            events={events}
          />
          
          {expandedCalendarDate && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-[#111]">
                  {getExpandedLabel()}
                </h4>
                <button 
                  onClick={() => setExpandedCalendarDate(null)}
                  className="text-xs text-[#6F6F6F] hover:text-[#111] transition-colors"
                >
                  Close
                </button>
              </div>
              
              <div className="space-y-2">
                {expandedCalendarEvents.length > 0 ? (
                  expandedCalendarEvents.map((event) => (
                    <EventCard 
                      key={event.id}
                      event={event}
                      onClick={() => handleEventClick(event)}
                      variant="compact"
                      canEdit={canEditEvent(event)}
                      onEdit={() => handleEditEvent(event)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-[#6F6F6F] py-4 text-center bg-white/50 rounded-xl">
                    No events on this day
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      
      <footer className="mt-12 py-6 border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-[#6F6F6F]">
            Clubly is an independent platform and is not affiliated with or endorsed by {school.name}.
          </p>
          <p className="text-xs text-[#6F6F6F] mt-2">
            © {new Date().getFullYear()} Clubly. All rights reserved.
          </p>
        </div>
      </footer>
      
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
