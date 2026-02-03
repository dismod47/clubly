import { useMemo } from 'react';
import { categoryEmojis, type OrgEvent } from '@/types';

interface WeekCalendarProps {
  onDayClick: (date: string) => void;
  expandedDate: string | null;
  datesWithEvents: string[];
  events: OrgEvent[];
}

export function WeekCalendar({ onDayClick, expandedDate, datesWithEvents, events }: WeekCalendarProps) {
  // Generate current week (Mon-Sun)
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday
    
    // Start from Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    
    return days;
  }, []);
  
  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };
  
  const isExpanded = (date: Date): boolean => {
    return formatDateKey(date) === expandedDate;
  };
  
  const hasEvents = (date: Date): boolean => {
    return datesWithEvents.includes(formatDateKey(date));
  };
  
  const getEventsForDay = (date: Date) => {
    const dateKey = formatDateKey(date);
    return events.filter(e => e.date === dateKey);
  };
  
  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  const getDayNumber = (date: Date): number => {
    return date.getDate();
  };
  
  // Get preview events for a day (up to 3)
  const getPreviewEvents = (date: Date): { events: { text: string; emoji: string }[]; moreCount: number } | null => {
    const dayEvents = getEventsForDay(date);
    if (dayEvents.length === 0) return null;
    
    const previewEvents = dayEvents.slice(0, 3).map(event => {
      const emoji = categoryEmojis[event.category] || '📌';
      let text = event.title;
      if (text.length > 14) {
        text = text.slice(0, 12) + '...';
      }
      return { text, emoji };
    });
    
    const moreCount = Math.max(0, dayEvents.length - 3);
    
    return { events: previewEvents, moreCount };
  };
  
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {weekDays.map((date, index) => {
        const dateKey = formatDateKey(date);
        const today = isToday(date);
        const expanded = isExpanded(date);
        const hasDayEvents = hasEvents(date);
        const preview = getPreviewEvents(date);
        
        return (
          <button
            key={index}
            onClick={() => onDayClick(dateKey)}
            className={`
              relative flex flex-col items-center p-2 rounded-xl transition-all duration-200 min-h-[120px]
              ${expanded 
                ? 'bg-[#111] text-white shadow-lg scale-[1.02]' 
                : today 
                  ? 'bg-[#FF6B35] text-white shadow-md' 
                  : hasDayEvents 
                    ? 'bg-white hover:bg-gray-50 text-[#111] shadow-sm' 
                    : 'bg-white/50 text-[#6F6F6F] hover:bg-white'
              }
            `}
          >
            {/* Day name */}
            <span className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${
              expanded || today ? 'text-white/80' : 'text-[#6F6F6F]'
            }`}>
              {getDayName(date)}
            </span>
            
            {/* Date number */}
            <span className={`text-lg font-bold leading-none mb-2 ${
              expanded || today ? 'text-white' : 'text-[#111]'
            }`}>
              {getDayNumber(date)}
            </span>
            
            {/* Event previews - up to 3 */}
            {preview ? (
              <div className="w-full text-left space-y-0.5 flex-1">
                {preview.events.map((event, i) => (
                  <div key={i} className={`text-[8px] leading-tight truncate ${
                    expanded || today ? 'text-white/90' : 'text-[#6F6F6F]'
                  }`}>
                    <span className="mr-0.5">{event.emoji}</span>
                    {event.text}
                  </div>
                ))}
                {preview.moreCount > 0 && (
                  <div className={`text-[7px] mt-0.5 ${
                    expanded || today ? 'text-white/60' : 'text-[#6F6F6F]/70'
                  }`}>
                    +{preview.moreCount} more
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full flex-1" />
            )}
            
            {/* Today indicator dot */}
            {today && !expanded && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-[#FF6B35] text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm">
                T
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
