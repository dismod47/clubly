import type { OrgEvent } from '@/types';
import { categoryColors, categoryEmojis } from '@/types';
import { MapPin, Clock, Pencil } from 'lucide-react';

interface EventCardProps {
  event: OrgEvent;
  onClick: () => void;
  variant?: 'default' | 'compact' | 'minimal';
  canEdit?: boolean;
  onEdit?: () => void;
}

export function EventCard({ event, onClick, variant = 'default', canEdit, onEdit }: EventCardProps) {
  const bgColor = categoryColors[event.category];
  const emoji = categoryEmojis[event.category];

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={onClick}
        className="w-full bg-white rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md will-change-transform border border-gray-100"
      >
        <div className="flex items-start gap-3">
          {/* Org avatar or logo */}
          {event.logoUrl ? (
            <img 
              src={event.logoUrl} 
              alt={event.organization}
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{ backgroundColor: bgColor }}
            >
              {emoji}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] leading-tight text-[#111] line-clamp-1 mb-0.5">
              {event.title}
            </h3>
            <p className="text-[13px] text-[#6F6F6F] font-medium mb-1">
              {event.orgShortName}
            </p>
            <div className="flex items-center gap-2 text-[12px] text-[#6F6F6F]">
              <span className="flex items-center gap-0.5">
                <Clock size={11} />
                {event.startTime}
              </span>
              <span className="flex items-center gap-0.5 truncate">
                <MapPin size={11} />
                {event.location.split(',')[0]}
              </span>
            </div>
          </div>

          {/* Edit button */}
          {canEdit && (
            <button
              onClick={handleEditClick}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="Edit event"
            >
              <Pencil size={14} className="text-[#6F6F6F]" />
            </button>
          )}
        </div>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="w-full bg-white rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md will-change-transform border border-gray-100"
      >
        <div className="flex items-start gap-3">
          {/* Logo or category emoji */}
          {event.logoUrl ? (
            <img 
              src={event.logoUrl} 
              alt={event.organization}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{ backgroundColor: bgColor }}
            >
              {emoji}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[16px] leading-tight text-[#111] line-clamp-1 mb-1">
              {event.title}
            </h3>
            <p className="text-[14px] text-[#6F6F6F] font-medium mb-2">
              {event.organization}
            </p>
            <div className="flex items-center gap-3 text-[13px] text-[#6F6F6F]">
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {event.startTime}
              </span>
              <span className="flex items-center gap-1 truncate">
                <MapPin size={13} />
                {event.location}
              </span>
            </div>
          </div>

          {/* Edit button */}
          {canEdit && (
            <button
              onClick={handleEditClick}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="Edit event"
            >
              <Pencil size={14} className="text-[#6F6F6F]" />
            </button>
          )}
        </div>
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg will-change-transform border border-gray-100"
    >
      {/* Header: Logo/Category + Org + Edit */}
      <div className="flex items-center gap-2 mb-3">
        {event.logoUrl ? (
          <img 
            src={event.logoUrl} 
            alt={event.organization}
            className="w-8 h-8 rounded-lg object-cover"
          />
        ) : (
          <span 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ backgroundColor: bgColor }}
          >
            {emoji}
          </span>
        )}
        <span className="text-[13px] font-medium text-[#6F6F6F] flex-1">
          {event.organization}
        </span>
        {canEdit && (
          <button
            onClick={handleEditClick}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            title="Edit event"
          >
            <Pencil size={14} className="text-[#6F6F6F]" />
          </button>
        )}
      </div>
      
      {/* Title */}
      <h3 className="font-semibold text-[18px] leading-tight text-[#111] mb-3">
        {event.title}
      </h3>
      
      {/* Meta info */}
      <div className="flex items-center gap-4 text-[13px] text-[#6F6F6F]">
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {event.startTime}
        </span>
        <span className="flex items-center gap-1.5 truncate">
          <MapPin size={14} />
          {event.location}
        </span>
      </div>
    </button>
  );
}
