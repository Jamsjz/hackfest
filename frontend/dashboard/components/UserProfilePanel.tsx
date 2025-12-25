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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="bg-white/70 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-agri-600 to-emerald-700 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full hover:bg-black/30 transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar & Info */}
        <div className="px-6 relative -mt-12 mb-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-white p-1.5 shadow-lg">
            <div className="w-full h-full rounded-full bg-agri-100 flex items-center justify-center text-agri-700 text-3xl font-bold border border-agri-200">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mt-3">{user.username}</h2>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3 h-3" /> {user.locationName}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-agri-500 text-agri-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-agri-500 text-agri-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Security
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[300px] custom-scrollbar">
          {activeTab === 'info' ? (
            <div className="space-y-4">
              {message && (
                <div className={`p-2 rounded-lg text-xs font-bold text-center ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message}
                </div>
              )}

              <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-start gap-3 shadow-sm">
                <div className="bg-white/50 p-2 rounded-lg text-agri-600 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase font-bold">Full Name</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-1.5 bg-white/50 border border-gray-200 rounded text-sm outline-none focus:border-agri-500"
                        autoFocus
                      />
                      <button onClick={handleUpdateProfile} disabled={isSaving} className="text-green-600 hover:text-green-700">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => { setIsEditing(false); setEditName(user.username); }} className="text-red-500 hover:text-red-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-800 font-medium">{user.username}</p>
                  )}
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="ml-auto text-gray-400 hover:text-agri-600 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-start gap-3 shadow-sm">
                <div className="bg-white/50 p-2 rounded-lg text-agri-600 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Location</p>
                  <p className="text-gray-800 font-medium">{user.locationName}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{user.coordinates?.lat?.toFixed(4)}, {user.coordinates?.lng?.toFixed(4)}</p>
                </div>
              </div>

              <div className="bg-blue-100/30 backdrop-blur-md p-4 rounded-xl border border-blue-200/50 flex items-center gap-3 shadow-sm">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-blue-800">Account Status: Active</p>
                  <p className="text-xs text-blue-600">
                    {isBackendConnected ? 'Connected to Cloud' : 'Offline Mode'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-bold text-gray-700">Change Password</span>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                Note: Password management is disabled in this demo environment.
              </p>

              <input
                type="password"
                placeholder="Current Password"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-agri-500 outline-none text-sm transition-all"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-agri-500 outline-none text-sm transition-all"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-agri-500 outline-none text-sm transition-all"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />

              {message && (
                <p className={`text-xs font-bold text-center ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                  {message}
                </p>
              )}

              <button
                onClick={handlePasswordChange}
                disabled={!passwords.current || !passwords.new || !passwords.confirm}
                className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                Update Password
              </button>
            </div>
          )}
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-white/10 bg-transparent">
          <button
            onClick={onLogout}
            className="w-full py-3 border border-red-100 bg-white text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfilePanel;