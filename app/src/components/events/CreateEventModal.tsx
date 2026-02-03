import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import type { EventCategory } from '@/types';
import { categoryEmojis } from '@/types';
import { createEvent } from '@/lib/events-api';
import { logActivity } from '@/lib/admin-api';
import { EventCard } from './EventCard';
import type { AuthUser } from '@/lib/auth';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  schoolId?: string;
  onEventCreated: () => void;
}

const categories: (EventCategory | 'Other')[] = ['Social', 'Meeting', 'Fundraiser', 'Cultural', 'Greek', 'Service', 'Other'];

export function CreateEventModal({ isOpen, onClose, user, onEventCreated }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<EventCategory>('Social');
  const [customCategory, setCustomCategory] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const previewEvent = useMemo(() => {
    const now = new Date();
    let startDateTime = now;
    let endDateTime = new Date(now.getTime() + 60 * 60 * 1000);

    if (date && startTime) {
      startDateTime = new Date(`${date}T${startTime}`);
    }
    if (date && endTime) {
      endDateTime = new Date(`${date}T${endTime}`);
    }

    return {
      id: 'preview',
      title: title || 'Event Title',
      description: description || 'Event description will appear here...',
      startTime: startDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      endTime: endDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      location: location || 'Location TBD',
      category: category,
      customCategory: category === 'Other' ? customCategory : undefined,
      organization: user?.organizationName || 'Your Organization',
      orgShortName: (user?.organizationName || 'ORG').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 5),
      date: date || now.toISOString().split('T')[0],
    };
  }, [title, description, date, startTime, endTime, location, category, customCategory, user]);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div 
          className="relative w-full max-w-md bg-white rounded-2xl p-6 text-center"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-gray-600">Please log in to create events.</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b]"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const startDateTime = date && startTime ? new Date(`${date}T${startTime}`) : undefined;
    const endDateTime = date && endTime ? new Date(`${date}T${endTime}`) : undefined;

    const result = await createEvent({
      title: title || undefined,
      description: description || undefined,
      startTime: startDateTime,
      endTime: endDateTime,
      location: location || undefined,
      category,
      customCategory: category === 'Other' ? customCategory : undefined,
      orgId: user.id,
      orgName: user.organizationName,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Log the event creation
    if (result.event) {
      await logActivity(
        'event_created',
        user.id,
        user.organizationName,
        'event',
        result.event.id,
        result.event.title,
        { date: result.event.date, location: result.event.location }
      );
    }

    setLoading(false);
    onEventCreated();
    onClose();
    
    // Reset form
    setTitle('');
    setDescription('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setCategory('Social');
    setCustomCategory('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className="relative w-full sm:max-w-lg max-h-[95vh] overflow-auto bg-white rounded-t-2xl sm:rounded-2xl animate-in slide-in-from-bottom duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111]">Create Event</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-[#6F6F6F]">
            Posting as <span className="font-medium text-[#111]">{user.organizationName}</span>
          </p>

          <div>
            <label className="block text-xs font-medium text-[#6F6F6F] mb-1">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. General Body Meeting"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6F6F6F] mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's happening at this event?"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 outline-none text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#6F6F6F] mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6F6F6F] mb-1">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6F6F6F] mb-1">End</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6F6F6F] mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Student Center 201"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6F6F6F] mb-1">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat as EventCategory)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === cat 
                      ? 'bg-[#FF6B35] text-white' 
                      : 'bg-gray-100 text-[#111] hover:bg-gray-200'
                  }`}
                >
                  {categoryEmojis[cat as EventCategory] || '📌'} {cat}
                </button>
              ))}
            </div>
            {category === 'Other' && (
              <input
                type="text"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="Enter custom category"
                className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 outline-none text-sm"
              />
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-[#6F6F6F] mb-3">Preview</p>
            <EventCard event={previewEvent} onClick={() => {}} variant="minimal" />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#e55a2b] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Post Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
