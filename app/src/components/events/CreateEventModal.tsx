import { useState, useMemo, useRef } from 'react';
import { X, Copy, Plus, Trash2, Video, Upload, XCircle } from 'lucide-react';
import type { EventCategory } from '@/types';
import { categoryEmojis } from '@/types';
import { createEvent, uploadVideo } from '@/lib/events-api';
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

  // Multi-day duplication state
  const [duplicateEnabled, setDuplicateEnabled] = useState(false);
  const [additionalDates, setAdditionalDates] = useState<string[]>([]);

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addAdditionalDate = () => {
    setAdditionalDates([...additionalDates, '']);
  };

  const removeAdditionalDate = (index: number) => {
    setAdditionalDates(additionalDates.filter((_, i) => i !== index));
  };

  const updateAdditionalDate = (index: number, value: string) => {
    const updated = [...additionalDates];
    updated[index] = value;
    setAdditionalDates(updated);
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('Video must be less than 50MB');
      return;
    }

    // Validate file type
    if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) {
      setError('Only MP4, MOV, and WebM videos are allowed');
      return;
    }

    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setError('');

    // Upload video
    setVideoUploading(true);
    const result = await uploadVideo(file);
    setVideoUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setVideoUrl(result.url);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoUrl(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

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
      videoUrl: videoUrl || undefined,
    };
  }, [title, description, date, startTime, endTime, location, category, customCategory, user, videoUrl]);

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

    // Collect all dates to create events for
    const allDates = [date];
    if (duplicateEnabled) {
      const validAdditionalDates = additionalDates.filter(d => d && d !== date);
      allDates.push(...validAdditionalDates);
    }

    // Filter out empty dates
    const datesToCreate = allDates.filter(d => d);

    if (datesToCreate.length === 0) {
      setError('Please select at least one date');
      setLoading(false);
      return;
    }

    let createdCount = 0;
    let lastError = '';

    // Create event for each date
    for (const eventDate of datesToCreate) {
      // Use provided time, or default to noon to avoid timezone issues
      const startDateTime = eventDate ? new Date(`${eventDate}T${startTime || '12:00'}`) : undefined;
      const endDateTime = eventDate ? new Date(`${eventDate}T${endTime || '13:00'}`) : undefined;

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
        videoUrl: videoUrl,
      });

      if (result.error) {
        lastError = result.error;
        continue;
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
        createdCount++;
      }
    }

    if (createdCount === 0) {
      setError(lastError || 'Failed to create events');
      setLoading(false);
      return;
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
    setDuplicateEnabled(false);
    setAdditionalDates([]);
    removeVideo();
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

          {/* Multi-day duplication toggle */}
          <div className="border border-gray-200 rounded-lg p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={duplicateEnabled}
                onChange={e => {
                  setDuplicateEnabled(e.target.checked);
                  if (!e.target.checked) setAdditionalDates([]);
                }}
                className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <Copy size={14} className="text-[#6F6F6F]" />
              <span className="text-sm font-medium text-[#111]">Duplicate to multiple days</span>
            </label>

            {duplicateEnabled && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-[#6F6F6F]">
                  Add additional dates to create this event on multiple days
                </p>

                {additionalDates.map((additionalDate, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="date"
                      value={additionalDate}
                      onChange={e => updateAdditionalDate(index, e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/20 outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalDate(index)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addAdditionalDate}
                  className="flex items-center gap-1 text-xs font-medium text-[#FF6B35] hover:text-[#e55a2b] transition-colors"
                >
                  <Plus size={14} />
                  Add another date
                </button>

                {additionalDates.length > 0 && (
                  <p className="text-xs text-[#6F6F6F] bg-gray-50 px-2 py-1.5 rounded">
                    This will create {additionalDates.filter(d => d).length + 1} events total
                  </p>
                )}
              </div>
            )}
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

          {/* Video Upload */}
          <div>
            <label className="block text-xs font-medium text-[#6F6F6F] mb-1">
              Video (optional)
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleVideoSelect}
              className="hidden"
            />

            {!videoFile ? (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#FF6B35] hover:bg-orange-50/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <Video size={20} className="text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
                </div>
                <span className="text-sm text-gray-500 group-hover:text-[#FF6B35] transition-colors">
                  Add a video to showcase your event
                </span>
                <span className="text-xs text-gray-400">MP4, MOV, WebM • Max 50MB • 60s recommended</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-black">
                {videoPreviewUrl && (
                  <video
                    src={videoPreviewUrl}
                    className="w-full max-h-48 object-contain"
                    controls
                    muted
                  />
                )}
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <XCircle size={18} className="text-white" />
                </button>
                {videoUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  </div>
                )}
                {videoUrl && !videoUploading && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-green-500 text-white text-xs flex items-center gap-1">
                    <Upload size={12} />
                    Uploaded
                  </div>
                )}
              </div>
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
            {loading
              ? 'Creating...'
              : duplicateEnabled && additionalDates.filter(d => d).length > 0
                ? `Post ${additionalDates.filter(d => d).length + 1} Events`
                : 'Post Event'
            }
          </button>
        </form>
      </div>
    </div>
  );
}
