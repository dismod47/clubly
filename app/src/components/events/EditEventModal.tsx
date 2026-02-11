import { useState, useEffect, useRef } from 'react';
import { X, Video, XCircle, Upload } from 'lucide-react';
import type { EventCategory, OrgEvent } from '@/types';
import { categoryEmojis } from '@/types';
import { updateEvent, uploadVideo } from '@/lib/events-api';
import type { AuthUser } from '@/lib/auth';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  event: OrgEvent | null;
  isAdmin?: boolean;
  onEventUpdated: () => void;
}

const categories: (EventCategory | 'Other')[] = ['Social', 'Meeting', 'Fundraiser', 'Cultural', 'Greek', 'Service', 'Other'];

export function EditEventModal({ isOpen, onClose, user, event, isAdmin = false, onEventUpdated }: EditEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<EventCategory>('Social');
  const [customCategory, setCustomCategory] = useState('');

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(event.date);
      setLocation(event.location);
      setCategory(event.category);
      setCustomCategory(event.customCategory || '');

      // Set video URL if exists
      setVideoUrl(event.videoUrl || null);
      setVideoPreviewUrl(event.videoUrl || null);
      setVideoFile(null);

      // Parse time from event.startTime/endTime (format: "3:00 PM")
      // We need to convert to 24h format for the input
      const parseTime = (timeStr: string) => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let hours = parseInt(match[1]);
          const minutes = match[2];
          const period = match[3].toUpperCase();
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
        return '';
      };

      setStartTime(parseTime(event.startTime));
      setEndTime(parseTime(event.endTime));
    }
  }, [event, isOpen]);

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('Video must be less than 50MB');
      return;
    }

    if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) {
      setError('Only MP4, MOV, and WebM videos are allowed');
      return;
    }

    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setError('');

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
    if (videoPreviewUrl && !event?.videoUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  if (!isOpen || !event) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div 
          className="relative w-full max-w-md bg-white rounded-2xl p-6 text-center"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-gray-600">Please log in to edit events.</p>
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

    // Use provided time, or default to noon to avoid timezone issues
    const startDateTime = date ? new Date(`${date}T${startTime || '12:00'}`) : undefined;
    const endDateTime = date ? new Date(`${date}T${endTime || '13:00'}`) : undefined;

    const result = await updateEvent(
      event.id,
      user.id,
      isAdmin,
      {
        title: title || undefined,
        description: description || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        location: location || undefined,
        category,
        customCategory: category === 'Other' ? customCategory : undefined,
        videoUrl: videoUrl,
      }
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    onEventUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className="relative w-full sm:max-w-lg max-h-[95vh] overflow-auto bg-white rounded-t-2xl sm:rounded-2xl animate-in slide-in-from-bottom duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111]">Edit Event</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-[#6F6F6F]">
            Editing as <span className="font-medium text-[#111]">{user.organizationName}</span>
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

            {!videoPreviewUrl ? (
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
                <video
                  src={videoPreviewUrl}
                  className="w-full max-h-48 object-contain"
                  controls
                  muted
                />
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
                    {videoFile ? 'Uploaded' : 'Video attached'}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#e55a2b] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
