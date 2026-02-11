import type { OrgEvent } from '@/types';
import { categoryColors, categoryEmojis } from '@/types';
import { MapPin, Clock, X, Users, Heart, Trash2 } from 'lucide-react';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { deleteEvent } from '@/lib/events-api';
import gsap from 'gsap';

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
  const [isAnimating, setIsAnimating] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animation
  useLayoutEffect(() => {
    if (!isOpen || !backdropRef.current || !modalRef.current) return;

    setIsAnimating(true);
    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    tl.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power2.out' }
    );

    tl.fromTo(
      modalRef.current,
      { y: 100, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' },
      '-=0.15'
    );

    return () => {
      tl.kill();
    };
  }, [isOpen, event?.id]);

  const handleClose = () => {
    if (!backdropRef.current || !modalRef.current || isAnimating) return;

    setIsAnimating(true);
    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        onClose();
      },
    });

    tl.to(modalRef.current, {
      y: 50,
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.in',
    });

    tl.to(
      backdropRef.current,
      { opacity: 0, duration: 0.15, ease: 'power2.in' },
      '-=0.1'
    );
  };

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
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isAnimating]);

  if (!event || !isOpen) return null;

  const bgColor = categoryColors[event.category];
  const emoji = categoryEmojis[event.category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div ref={backdropRef} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full sm:max-w-lg max-h-[85vh] overflow-auto glass-card-strong rounded-t-3xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95"
        >
          <X size={18} className="text-[#111]" />
        </button>
        
        {/* Video or Category header */}
        {event.videoUrl ? (
          <div className="relative bg-black">
            <video
              src={event.videoUrl}
              className="w-full max-h-64 object-contain"
              controls
              poster={event.thumbnailUrl || undefined}
              playsInline
            />
            <div
              className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
              style={{ backgroundColor: bgColor }}
            >
              <span>{emoji}</span>
              <span className="text-[#111]/80">{event.category}</span>
            </div>
          </div>
        ) : (
          <div
            className="h-32 flex flex-col items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
            <span className="text-5xl mb-1 relative z-10 drop-shadow-sm">{emoji}</span>
            <span className="text-sm font-semibold text-[#111]/60 uppercase tracking-wider relative z-10">{event.category}</span>
          </div>
        )}
        
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
          <div className="flex flex-wrap gap-2 mb-5">
            <div className="flex items-center gap-1.5 text-[13px] text-[#111] bg-gradient-to-r from-gray-100 to-gray-50 px-3.5 py-2 rounded-full font-medium shadow-sm">
              <Clock size={14} className="text-uh-orange" />
              <span>{event.startTime} – {event.endTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-[#111] bg-gradient-to-r from-gray-100 to-gray-50 px-3.5 py-2 rounded-full font-medium shadow-sm">
              <MapPin size={14} className="text-uh-teal" />
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
            <button className="flex-1 btn-primary flex items-center justify-center gap-2 hover-glow focus-ring">
              <Heart size={18} />
              <span>Interested</span>
            </button>
            <button className="px-4 py-3 rounded-full border border-gray-200 text-[#111] font-medium hover:bg-gray-50 hover-scale focus-ring transition-colors">
              <Users size={18} />
            </button>
            {(isAdmin || (userId && event.orgId && userId === event.orgId)) && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-3 rounded-full border border-red-200 text-red-500 font-medium hover:bg-red-50 hover-scale focus-ring disabled:opacity-50 transition-colors"
              >
                {deleting ? <span className="w-[18px] h-[18px] border-2 border-red-500 border-t-transparent rounded-full spinner" /> : <Trash2 size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
