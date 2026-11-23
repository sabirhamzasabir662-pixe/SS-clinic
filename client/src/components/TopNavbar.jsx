import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, Bell, ChevronDown, Menu, User, Settings, LogOut, Activity, Phone, X } from 'lucide-react';

export default function TopNavbar({ setMobileOpen }) {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  // Profile Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Live Patient Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Click outside listener for profile and search dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Live Search for Patients
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length >= 2) {
      setIsSearching(true);
      setSearchOpen(true);
      const timer = setTimeout(async () => {
        try {
          const data = await api.searchPatients(token, query);
          setSearchResults(data.patients || []);
        } catch (err) {
          console.error('Failed searching patients:', err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setSearchOpen(false);
      setIsSearching(false);
    }
  }, [searchQuery, token]);

  const handleSelectPatient = (patientId) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/patients/${patientId}`);
  };

  return (
    <header className="h-[72px] bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 select-none">
      
      {/* Left: Hamburger (mobile) + Live Patient Search */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Search Input & Dropdown Container */}
        <div className="relative w-full max-w-[360px]" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) {
                  setSearchOpen(true);
                }
              }}
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchOpen(false);
                }}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Live Search Dropdown */}
          {searchOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fadeIn">
              
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
                <span>Patient Search Results</span>
                {isSearching && <span className="animate-pulse text-blue-600 lowercase font-normal">searching...</span>}
              </div>

              <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                {isSearching && searchResults.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span>Searching matching patients...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium">
                    <p className="text-slate-400 text-sm mb-1">🔍</p>
                    No patient found
                  </div>
                ) : (
                  searchResults.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handleSelectPatient(patient.id)}
                      className="w-full p-3 text-left hover:bg-blue-50/60 transition flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                              {patient.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({patient.age} yrs)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {patient.phone || 'No phone'}
                            </span>
                          </div>
                          {/* Small line with patient's latest disease */}
                          <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium mt-1">
                            <Activity className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>Latest Diagnosis: <strong className="text-slate-800">{patient.latestDisease || 'General Checkup'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-semibold text-blue-600 group-hover:underline">
                          View Profile →
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications Bell, Divider, Doctor Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Notification Bell with Red Badge "3" */}
        <button 
          className="relative p-2 text-slate-600 hover:text-slate-900 transition rounded-full hover:bg-slate-50"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            3
          </span>
        </button>

        {/* Thin Vertical Divider */}
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        {/* Doctor Avatar & Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition focus:outline-none"
          >
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 border border-slate-100 shadow-sm shrink-0 flex items-center justify-center">
              <img
                src="/assets/doctor_avatar_exact.png"
                alt="Dr. Shazaib"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full bg-blue-600 text-white font-bold text-sm items-center justify-center">
                DS
              </div>
            </div>

            {/* Doctor Info */}
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {user?.name || 'Dr. Shazaib'}
              </p>
              <p className="text-[11px] text-slate-400 font-normal">
                {user?.role || 'Administrator'}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-bold text-slate-800">{user?.name || 'Dr. Shazaib'}</p>
                <p className="text-[10px] text-slate-400">{user?.role || 'Administrator'}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Clinic Settings</span>
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
