import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Lock, LogOut, Shield, MapPin, Edit3, CheckCircle, AlertCircle } from './ui/Icons';
import { useDashboard } from '../DashboardContext';
import * as api from '../../lib/api-service';

interface UserProfilePanelProps {
  user: any; // Using any for ExtendedUserProfile compatibility
  onClose: () => void;
  onLogout: () => void;
}

const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ user, onClose, onLogout }) => {
  const { setUser, isBackendConnected } = useDashboard();
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.username);
  const [isSaving, setIsSaving] = useState(false);

  // Password state (Mock only as backend doesn't support auth yet)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdateProfile = async () => {
    if (!editName.trim() || editName === user.username) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      if (isBackendConnected) {
        await api.updateUser({
          current_username: user.username,
          new_username: editName
        });
      }

      // Update local state
      setUser({
        ...user,
        username: editName
      });

      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      setMessage("New passwords do not match.");
      return;
    }
    if (passwords.new.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    // Mock simulation
    setMessage("Password updated (Demo Mode)");
    setPasswords({ current: '', new: '', confirm: '' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="glass-card-dark w-full max-w-md rounded-2xl overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Background */}
        <div className="h-28 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 relative overflow-hidden">
          {/* Abstract pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-black/20 rounded-full blur-2xl translate-x-1/2 translate-y-1/2"></div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar & Info */}
        <div className="px-6 relative -mt-12 mb-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#1a1a1e] p-1 shadow-2xl border-2 border-amber-500/30">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mt-3">{user.username}</h2>
          <div className="flex items-center justify-center gap-1 text-sm text-zinc-500 mt-1">
            <MapPin className="w-3 h-3" /> {user.locationName}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
          >
            Security
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[300px] custom-scrollbar">
          {activeTab === 'info' ? (
            <div className="space-y-4">
              {message && (
                <div className={`p-2 rounded-lg text-xs font-bold text-center ${message.includes('success') ? 'badge-success-dark' : 'badge-danger-dark'}`}>
                  {message}
                </div>
              )}

              <div className="glass-card-dark p-4 flex items-start gap-3">
                <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-zinc-600 uppercase font-bold">Full Name</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2 input-dark rounded-lg text-sm"
                        autoFocus
                      />
                      <button onClick={handleUpdateProfile} disabled={isSaving} className="text-emerald-400 hover:text-emerald-300">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => { setIsEditing(false); setEditName(user.username); }} className="text-red-400 hover:text-red-300">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-white font-medium">{user.username}</p>
                  )}
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="ml-auto text-zinc-600 hover:text-amber-400 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="glass-card-dark p-4 flex items-start gap-3">
                <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-600 uppercase font-bold">Location</p>
                  <p className="text-white font-medium">{user.locationName}</p>
                  <p className="text-xs text-zinc-600 font-mono mt-0.5">{user.coordinates?.lat?.toFixed(4)}, {user.coordinates?.lng?.toFixed(4)}</p>
                </div>
              </div>

              <div className="glass-card-dark p-4 flex items-center gap-3 border-blue-500/20">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-bold text-blue-400">Account Status: Active</p>
                  <p className="text-xs text-zinc-600">
                    {isBackendConnected ? 'Connected to Cloud' : 'Offline Mode'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-zinc-600" />
                <span className="text-sm font-bold text-white">Change Password</span>
              </div>

              <p className="text-xs text-zinc-600 mb-2">
                Note: Password management is disabled in this demo environment.
              </p>

              <input
                type="password"
                placeholder="Current Password"
                className="w-full p-3 input-dark rounded-xl text-sm"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-3 input-dark rounded-xl text-sm"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full p-3 input-dark rounded-xl text-sm"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />

              {message && (
                <p className={`text-xs font-bold text-center ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}

              <button
                onClick={handlePasswordChange}
                disabled={!passwords.current || !passwords.new || !passwords.confirm}
                className="w-full py-3 bg-gradient-to-r from-zinc-700 to-zinc-600 text-white rounded-xl font-bold text-sm hover:from-zinc-600 hover:to-zinc-500 transition-colors disabled:opacity-50"
              >
                Update Password
              </button>
            </div>
          )}
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full py-3 border border-red-500/30 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/20 hover:border-red-500/50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfilePanel;