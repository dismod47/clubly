import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadLogo } from '@/lib/events-api';
import { logActivity } from '@/lib/admin-api';
import type { AuthUser } from '@/lib/auth';

interface OrgDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onUpdate: () => void;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function OrgDashboardModal({ isOpen, onClose, user, onUpdate }: OrgDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Profile state
  const [orgName, setOrgName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current user data
  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user]);

  async function loadUserData() {
    if (!user) return;
    
    const { data } = await supabase
      .from('users')
      .select('organization_name, logo_url')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setOrgName(data.organization_name);
      setLogoUrl(data.logo_url);
    }
  }

  if (!isOpen || !user) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let newLogoUrl = logoUrl;

      // Upload new logo if provided
      if (logoFile) {
        const uploadResult = await uploadLogo(logoFile);
        if (uploadResult.error) {
          setError(`Logo upload failed: ${uploadResult.error}`);
          setLoading(false);
          return;
        }
        newLogoUrl = uploadResult.url;
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          organization_name: orgName,
          logo_url: newLogoUrl,
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      // Log activity
      if (logoFile) {
        await logActivity(
          'logo_updated',
          user.id,
          user.organizationName,
          'organization',
          user.id,
          orgName
        );
      }

      setSuccess('Profile updated successfully!');
      setLogoFile(null);
      setLogoPreview(null);
      setLogoUrl(newLogoUrl);
      onUpdate();
    } catch {
      setError('Failed to update profile');
    }

    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Verify current password
      const { data: userData } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user.id)
        .single();

      if (!userData) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const currentHash = await hashPassword(currentPassword);
      if (currentHash !== userData.password_hash) {
        setError('Current password is incorrect');
        setLoading(false);
        return;
      }

      // Update password
      const newHash = await hashPassword(newPassword);
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newHash })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      // Log activity
      await logActivity(
        'password_changed',
        user.id,
        user.organizationName,
        'organization',
        user.id,
        user.organizationName
      );

      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Failed to change password');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#111]">Account Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Change Password
          </button>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111] mb-2">Organization Logo</label>
                <div className="flex items-center gap-4">
                  {(logoPreview || logoUrl) ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={logoPreview || logoUrl || ''} 
                        alt="Logo" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                      <ImageIcon size={24} className="text-gray-400" />
                    </div>
                  )}
                  <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    {logoUrl || logoPreview ? 'Change Logo' : 'Upload Logo'}
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {success && (
                <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2">
                  <Check size={16} />
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#e55a2b] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111] mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {success && (
                <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2">
                  <Check size={16} />
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#e55a2b] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
