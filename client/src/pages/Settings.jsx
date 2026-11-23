import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { Settings as SettingsIcon, Save, Key, User, Bell, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

export default function Settings() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const [profile, setProfile] = useState({
    name: user?.name || 'Dr. Shazaib',
    username: user?.username || 'shazaib',
    email: user?.email || 'shazaib@ssclinic.com',
    role: user?.role || 'Administrator',
    clinicName: 'SS Shifa Clinic',
    phone: '+92 300 1234567'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSavedMsg('Clinic settings updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setSavedMsg('Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex select-none">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 lg:pl-[258px] flex flex-col min-h-screen">
        <TopNavbar setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <div className="mb-7">
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              System Settings <SettingsIcon className="w-6 h-6 text-slate-700" />
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Configure clinic profile, security preferences, and administrative controls.
            </p>
          </div>

          {savedMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              ✓ {savedMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Clinic & Profile Settings */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Administrator Profile</h3>
                  <p className="text-xs text-slate-400">Manage account information</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Name</label>
                  <input
                    type="text"
                    value={profile.clinicName}
                    onChange={e => setProfile({ ...profile, clinicName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    disabled
                    value={profile.username}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1e5adb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  Save Profile
                </button>
              </form>
            </div>

            {/* Change Password Box */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Security &amp; Password</h3>
                  <p className="text-xs text-slate-400">Update temporary administrator credentials</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password (admin123)"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Shield className="w-4 h-4" />
                  Update Password
                </button>
              </form>
            </div>

          </div>
          <Footer />

        </main>
      </div>
    </div>
  );
}
