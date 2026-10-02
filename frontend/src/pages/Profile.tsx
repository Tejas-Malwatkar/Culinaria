import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile } from '../api/auth';
import { changePassword } from '../api/user.api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }

    try {
      setSavingProfile(true);
      const updated = await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });

      updateUser(updated);
      addToast('Profile updated successfully!', 'success');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('Please fill in both current and new password fields', 'error');
      return;
    }

    if (newPassword.length < 8) {
      addToast('New password must be at least 8 characters', 'error');
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword(currentPassword, newPassword);
      addToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* PROFILE HEADER CARD */}
        <div className="bg-white border border-amber-100 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-200 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-amber-500 text-white font-black text-3xl flex items-center justify-center border-4 border-amber-200 shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full uppercase">
                {user?.role || 'USER'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-600 italic pt-1">
              "{user?.bio || 'Culinary enthusiast & home chef.'}"
            </p>
          </div>
        </div>

        {/* EDIT PROFILE FORM */}
        <div className="bg-white border border-amber-100 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Edit Profile Information</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Email address cannot be changed</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Chef Headline</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Share your culinary interests, favorite cuisines, or cooking philosophy..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-60"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* CHANGE PASSWORD FORM */}
        <div className="bg-white border border-amber-100 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Security & Password</h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Min 8 Characters)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-60"
            >
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
