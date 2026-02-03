import type { OrgEvent } from '@/types';
import { categoryColors, categoryEmojis } from '@/types';
import { MapPin, Clock, X, Users, Heart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deleteEvent } from '@/lib/events-api';

interface EventDetailProps {
  event: OrgEvent | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  userId?: string;
  onEventDeleted?: () => void;
}

export function EventDetail({ event, isOpen, onClose, isAdmin, userId, onEventDeleted }: EventDetailProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!event || !userId) return;
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setDeleting(true);
    const result = await deleteEvent(event.id, userId, isAdmin ?? false);
    setDeleting(false);
    
    if (!result.error) {
      onEventDeleted?.();
      onClose();
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!event || !isOpen) return null;

  const bgColor = categoryColors[event.category];
  const emoji = categoryEmojis[event.category];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div 
        className="relative w-full sm:max-w-lg max-h-[85vh] overflow-auto bg-white rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm transition-transform hover:scale-105 active:scale-95"
        >
          <X size={18} className="text-[#111]" />
        </button>
        
        {/* Category header */}
        <div 
          className="h-28 flex flex-col items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <span className="text-4xl mb-1">{emoji}</span>
          <span className="text-sm font-medium text-[#111]/70">{event.category}</span>
        </div>
        
        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Org name */}
          <p className="text-[14px] font-medium text-[#6F6F6F] mb-1">
            {event.organization}
          </p>
          
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#111] mb-4 leading-tight">
            {event.title}
          </h2>
          
          {/* Quick info row */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-1.5 text-[13px] text-[#111] bg-gray-100 px-3 py-1.5 rounded-full">
              <Clock size={14} />
              <span>{event.startTime} – {event.endTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-[#111] bg-gray-100 px-3 py-1.5 rounded-full">
              <MapPin size={14} />
              <span>{event.location}</span>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <p className="text-[14px] text-[#6F6F6F] leading-relaxed">
              {event.description}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <button className="flex-1 btn-primary flex items-center justify-center gap-2">
              <Heart size={18} />
              <span>Interested</span>
            </button>
            <button className="px-4 py-3 rounded-full border border-gray-200 text-[#111] font-medium hover:bg-gray-50 transition-colors">
              <Users size={18} />
            </button>
            {isAdmin && (
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-3 rounded-full border border-red-200 text-red-500 font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
