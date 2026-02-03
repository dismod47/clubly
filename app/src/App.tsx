import { useState, useMemo, useEffect, useCallback } from 'react';
import { EventCard } from '@/components/events/EventCard';
import { EventDetail } from '@/components/events/EventDetail';
import { WeekCalendar } from '@/components/WeekCalendar';
import { AuthModal } from '@/components/auth/AuthModal';
import { CreateEventModal } from '@/components/events/CreateEventModal';
import { EditEventModal } from '@/components/events/EditEventModal';
import { useAuth } from '@/hooks/useAuth';
import { fetchEvents } from '@/lib/events-api';
import type { OrgEvent } from '@/types';
import { ChevronLeft, ChevronRight, Plus, LogOut } from 'lucide-react';

function App() {
  // Auth state
  const { user, login, register, logout, isAdmin } = useAuth();
  
  // Events state
  const [events, setEvents] = useState<OrgEvent[]>([]);
  
  // Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // State for Today section (arrow navigation)
  const [todayOffset, setTodayOffset] = useState(0);
  
  // State for week calendar expansion (independent)
  const [expandedCalendarDate, setExpandedCalendarDate] = useState<string | null>(null);
  
  // State for event detail modal
  const [selectedEvent, setSelectedEvent] = useState<OrgEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OrgEvent | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch events from Supabase
  const loadEvents = useCallback(async () => {
    const data = await fetchEvents();
    setEvents(data);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Helper to get events for a date
  const getEventsForDate = (date: string): OrgEvent[] => {
    return events
      .filter(event => event.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Get dates with events
  const getDatesWithEvents = (): string[] => {
    const dates = new Set(events.map(e => e.date));
    return Array.from(dates).sort();
  };
  
  // Calculate the date for Today section based on offset
  const todayDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + todayOffset);
    return date.toISOString().split('T')[0];
  }, [todayOffset]);
  
  // Get events for Today section
  const todayEvents = useMemo(() => {
    return getEventsForDate(todayDate);
  }, [todayDate, events]);

  // Get label for Today section
  const getTodayLabel = (): string => {
    if (todayOffset === 0) return 'Today';
    if (todayOffset === 1) return 'Tomorrow';
    const date = new Date(todayDate);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Navigation handlers for Today section
  const handlePrevDay = () => setTodayOffset(prev => prev - 1);
  const handleNextDay = () => setTodayOffset(prev => prev + 1);
  
  // Week calendar expansion handler
  const handleCalendarDayClick = (date: string) => {
    setExpandedCalendarDate(prev => prev === date ? null : date);
  };
  
  // Event click handler
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
  
  // Get expanded calendar events
  const expandedCalendarEvents = useMemo(() => {
    if (!expandedCalendarDate) return [];
    return getEventsForDate(expandedCalendarDate);
  }, [expandedCalendarDate]);
  
  // Get label for expanded section
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
  
  return (
    <div className="min-h-screen bg-[#F6F6F2] pb-24">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F6F6F2]/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Orange Clubly logo */}
            <div className="w-9 h-9 rounded-xl bg-[#FF6B35] flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="font-bold text-[18px] text-[#111] leading-tight">Clubly</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button 
                onClick={logout}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                title="Sign out"
              >
                <LogOut size={16} className="text-[#6F6F6F]" />
              </button>
            )}
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="w-9 h-9 rounded-full bg-[#FF6B35] flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              title="Create event"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="px-4 py-4">
        {/* TODAY SECTION - Primary */}
        <section className="mb-6">
          {/* Today header with arrows */}
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
          
          {/* Today's events */}
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
        
        {/* Divider */}
        <div className="h-px bg-gray-200 my-6" />
        
        {/* WEEK CALENDAR SECTION */}
        <section>
          <h3 className="text-sm font-semibold text-[#6F6F6F] uppercase tracking-wider mb-3">
            This Week
          </h3>
          
          {/* Week calendar */}
          <WeekCalendar 
            onDayClick={handleCalendarDayClick}
            expandedDate={expandedCalendarDate}
            datesWithEvents={getDatesWithEvents()}
            events={events}
          />
          
          {/* Expanded calendar events (independent from Today) */}
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
      
      {/* Event Detail Modal */}
      <EventDetail 
        event={selectedEvent}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        isAdmin={isAdmin}
        userId={user?.id}
        onEventDeleted={loadEvents}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={login}
        onRegister={register}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        user={user}
        onEventCreated={loadEvents}
      />

      {/* Edit Event Modal */}
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
    </div>
  );
}

export default App;
