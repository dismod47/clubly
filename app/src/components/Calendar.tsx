import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  datesWithEvents: string[];
}

export function Calendar({ selectedDate, onDateSelect, datesWithEvents }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const eventDatesSet = new Set(datesWithEvents);
  
  // Generate days for the current view (2 weeks starting from today)
  const generateDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Show 14 days starting from today
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    
    return days;
  };
  
  const days = generateDays();
  
  const formatDateKey = (date: Date): string => {
    // Use local timezone (not UTC) to match event date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const isSelected = (date: Date): boolean => {
    return formatDateKey(date) === selectedDate;
  };
  
  const hasEvents = (date: Date): boolean => {
    return eventDatesSet.has(formatDateKey(date));
  };
  
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };
  
  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'narrow' });
  };
  
  const getDayNumber = (date: Date): number => {
    return date.getDate();
  };
  
  const handleDateClick = (date: Date) => {
    onDateSelect(formatDateKey(date));
  };
  
  // Scroll to selected date on mount
  useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);
  
  return (
    <div className="w-full">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-medium text-[#6F6F6F]">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <div className="flex gap-1">
          <button 
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setCurrentMonth(newMonth);
            }}
          >
            <ChevronLeft size={16} className="text-[#6F6F6F]" />
          </button>
          <button 
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setCurrentMonth(newMonth);
            }}
          >
            <ChevronRight size={16} className="text-[#6F6F6F]" />
          </button>
        </div>
      </div>
      
      {/* Days strip */}
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {days.map((date, index) => {
          const selected = isSelected(date);
          const events = hasEvents(date);
          const today = isToday(date);
          
          return (
            <button
              key={index}
              data-selected={selected}
              onClick={() => handleDateClick(date)}
              className={`
                flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center
                transition-all duration-200 scroll-snap-align-start
                ${selected 
                  ? 'bg-[#111] text-white shadow-lg scale-105' 
                  : 'bg-white text-[#111] hover:bg-gray-50'
                }
              `}
              style={{ scrollSnapAlign: 'start' }}
            >
              <span className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${
                selected ? 'text-white/70' : 'text-[#6F6F6F]'
              }`}>
                {getDayName(date)}
              </span>
              <span className="text-lg font-bold leading-none">
                {getDayNumber(date)}
              </span>
              {/* Event indicator dot */}
              <div className="mt-1.5 flex gap-0.5">
                {events && (
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selected ? 'bg-[#FF4D2E]' : 'bg-[#FF4D2E]'
                  }`} />
                )}
                {!events && <span className="w-1.5 h-1.5 rounded-full transparent" />}
              </div>
              {/* Today indicator */}
              {today && !selected && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4D2E] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  T
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
