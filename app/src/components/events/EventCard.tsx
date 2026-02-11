import type { OrgEvent } from '@/types';
import { categoryColors, categoryEmojis } from '@/types';
import { MapPin, Clock, Pencil, Video } from 'lucide-react';

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
        className="w-full bg-white rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl will-change-transform group border border-gray-100"
        style={{
          boxShadow: `0 4px 20px -4px ${bgColor}40`
        }}
      >
        <div className="flex items-start gap-4">
          {/* Org avatar or logo */}
          {event.logoUrl ? (
            <img
              src={event.logoUrl}
              alt={event.organization}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-2 ring-white shadow-md"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl shadow-md"
              style={{ backgroundColor: bgColor }}
            >
              {emoji}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: bgColor }}
              >
                {event.category}
              </span>
              {event.videoUrl && (
                <span className="flex items-center gap-1 text-uh-purple text-xs font-medium">
                  <Video size={12} />
                  Video
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg leading-tight text-[#111] line-clamp-1 mb-1 group-hover:text-uh-purple transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-[#6F6F6F] font-medium mb-2">
              {event.organization}
            </p>
            <div className="flex items-center gap-4 text-sm text-[#6F6F6F]">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-uh-orange" />
                {event.startTime}
              </span>
              <span className="flex items-center gap-1.5 truncate">
                <MapPin size={14} className="text-uh-teal" />
                {event.location.split(',')[0]}
              </span>
            </div>
          </div>

          {/* Edit button */}
          {canEdit && (
            <button
              onClick={handleEditClick}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-uh-purple hover:text-white transition-all duration-200"
              title="Edit event"
            >
              <Pencil size={16} />
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
        className="w-full bg-white rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl will-change-transform group border border-gray-100"
        style={{
          boxShadow: `0 4px 20px -4px ${bgColor}40`
        }}
      >
        <div className="flex items-start gap-4">
          {/* Logo or category emoji */}
          {event.logoUrl ? (
            <img
              src={event.logoUrl}
              alt={event.organization}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 ring-2 ring-white shadow-md"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl shadow-md"
              style={{ backgroundColor: bgColor }}
            >
              {emoji}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: bgColor }}
              >
                {event.category}
              </span>
            </div>
            <h3 className="font-bold text-xl leading-tight text-[#111] line-clamp-1 mb-1 group-hover:text-uh-purple transition-colors">
              {event.title}
            </h3>
            <p className="text-base text-[#6F6F6F] font-medium mb-3">
              {event.organization}
            </p>
            <div className="flex items-center gap-4 text-sm text-[#6F6F6F]">
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-uh-orange" />
                {event.startTime}
              </span>
              <span className="flex items-center gap-1.5 truncate">
                <MapPin size={15} className="text-uh-teal" />
                {event.location}
              </span>
              {event.videoUrl && (
                <span className="flex items-center gap-1.5 text-uh-purple font-medium">
                  <Video size={15} />
                  Video
                </span>
              )}
            </div>
          </div>

          {/* Edit button */}
          {canEdit && (
            <button
              onClick={handleEditClick}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-uh-purple hover:text-white transition-all duration-200"
              title="Edit event"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      </button>
    );
  }

  // Default variant - most prominent
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-3xl p-6 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl will-change-transform group border border-gray-100 overflow-hidden relative"
      style={{
        boxShadow: `0 8px 30px -8px ${bgColor}50`
      }}
    >
      {/* Category accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ background: `linear-gradient(90deg, ${bgColor}, ${bgColor}88)` }}
      />

      {/* Header: Logo/Category + Org + Edit */}
      <div className="flex items-center gap-4 mb-4">
        {event.logoUrl ? (
          <img
            src={event.logoUrl}
            alt={event.organization}
            className="w-14 h-14 rounded-xl object-cover ring-2 ring-white shadow-lg"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg"
            style={{ backgroundColor: bgColor }}
          >
            {emoji}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
              style={{ backgroundColor: bgColor }}
            >
              {event.category}
            </span>
            {event.videoUrl && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-uh-purple/10 text-uh-purple text-xs font-semibold">
                <Video size={12} />
                Video
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-[#6F6F6F] truncate">
            {event.organization}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleEditClick}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-uh-purple hover:text-white transition-all duration-200 shadow-sm"
            title="Edit event"
          >
            <Pencil size={18} />
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-xl lg:text-2xl leading-tight text-[#111] mb-4 group-hover:text-uh-purple transition-colors">
        {event.title}
      </h3>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-uh-orange/10 text-[#111] font-medium">
          <Clock size={16} className="text-uh-orange" />
          {event.startTime}
        </span>
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-uh-teal/10 text-[#111] font-medium truncate">
          <MapPin size={16} className="text-uh-teal" />
          {event.location.split(',')[0]}
        </span>
      </div>
    </button>
  );
}
