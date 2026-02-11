import { useMemo } from 'react';
import { categoryEmojis, categoryColors, type OrgEvent } from '@/types';
import { Sparkles } from 'lucide-react';

interface WeekCalendarProps {
  onDayClick: (date: string) => void;
  expandedDate: string | null;
  datesWithEvents: string[];
  events: OrgEvent[];
  weekOffset?: number;
}

export function WeekCalendar({ onDayClick, expandedDate, datesWithEvents: _datesWithEvents, events, weekOffset = 0 }: WeekCalendarProps) {
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const dayOfWeek = today.getDay();

    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (weekOffset * 7));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }

    return days;
  }, [weekOffset]);

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

  const isSelected = (date: Date): boolean => {
    return formatDateKey(date) === expandedDate;
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

  return (
    <div className="grid grid-cols-7 gap-2 lg:gap-3">
      {weekDays.map((date, index) => {
        const dateKey = formatDateKey(date);
        const today = isToday(date);
        const selected = isSelected(date);
        const dayEvents = getEventsForDay(date);
        const eventCount = dayEvents.length;
        const intensity = getIntensityLevel(eventCount);
        const previewEvent = dayEvents[0];
        const uniqueCategories = [...new Set(dayEvents.map(e => e.category))];

        return (
          <button
            key={index}
            onClick={() => onDayClick(dateKey)}
            className={`
              relative flex flex-col rounded-xl lg:rounded-2xl transition-all duration-300 overflow-hidden p-2 lg:p-3
              ${selected
                ? 'bg-gradient-to-br from-[#111] via-[#1a1a2e] to-[#111] text-white shadow-xl scale-[1.02] ring-2 ring-uh-purple/40'
                : today
                  ? 'bg-gradient-to-br from-uh-orange via-uh-pink to-uh-purple text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  : eventCount > 0
                    ? `bg-gradient-to-br ${intensityGradients[intensity]} hover:shadow-lg hover:scale-[1.02] border border-gray-100`
                    : 'bg-white/60 hover:bg-white hover:shadow-md border border-gray-100/50'
              }
              min-h-[100px] lg:min-h-[120px]
            `}
          >
            {/* Day name */}
            <span className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider text-center ${
              selected || today ? 'text-white/70' : 'text-[#6F6F6F]'
            }`}>
              {getDayName(date)}
            </span>

            {/* Date number */}
            <span className={`text-2xl lg:text-3xl font-black leading-none text-center my-1 ${
              selected || today ? 'text-white' : 'text-[#111]'
            }`}>
              {getDayNumber(date)}
            </span>

            {/* Today badge */}
            {today && !selected && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-white/25 rounded-full text-[8px] font-bold text-white">
                TODAY
              </span>
            )}

            {/* Category indicators */}
            {eventCount > 0 && (
              <div className="flex items-center justify-center gap-0.5 mt-1 mb-1">
                {uniqueCategories.slice(0, 3).map((category, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center text-[8px] lg:text-[10px]"
                    style={{ backgroundColor: categoryColors[category] }}
                  >
                    {categoryEmojis[category]}
                  </span>
                ))}
              </div>
            )}

            {/* Event preview or count */}
            <div className="flex-1 flex flex-col justify-end">
              {eventCount > 0 ? (
                <div className="text-center">
                  {previewEvent && (
                    <p className={`text-[9px] lg:text-[10px] truncate px-1 mb-0.5 ${
                      selected || today ? 'text-white/80' : 'text-[#111]'
                    }`}>
                      {previewEvent.title.length > 12 ? previewEvent.title.slice(0, 10) + '...' : previewEvent.title}
                    </p>
                  )}
                  <span className={`text-[10px] lg:text-xs font-bold ${
                    selected || today ? 'text-white' : 'text-uh-purple'
                  }`}>
                    {eventCount === 1 ? '1 event' : `${eventCount} events`}
                  </span>
                  {intensity >= 3 && (
                    <Sparkles className={`w-3 h-3 mx-auto mt-0.5 ${
                      selected || today ? 'text-yellow-300' : 'text-uh-orange'
                    }`} />
                  )}
                </div>
              ) : (
                <span className={`text-[10px] text-center ${
                  selected || today ? 'text-white/40' : 'text-[#6F6F6F]/50'
                }`}>
                  -
                </span>
              )}
            </div>

            {/* Selected indicator */}
            {selected && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-uh-purple rounded-full mb-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}
