import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Activity, 
  Pill, 
  Users, 
  ClipboardList, 
  Calendar, 
  UserCheck, 
  BarChart2, 
  Settings, 
  Trash2,
  LogOut,
  Headphones,
  X
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Diseases', path: '/diseases', icon: Activity },
    { name: 'Medicines', path: '/medicines', icon: Pill },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Prescriptions', path: '/prescriptions', icon: ClipboardList },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Doctors', path: '/doctors', icon: UserCheck },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Recycle Bin', path: '/recycle-bin', icon: Trash2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Fixed Left Sidebar (~258px) */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50
        w-[258px] bg-gradient-to-b from-[#113a96] via-[#1a4ecb] to-[#1c53d8]
        text-white flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-xl lg:shadow-none select-none
      `}>
        
        {/* Top Header & Brand */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/assets/sidebar_logo_transparent.png" 
                  alt="SS Shifa Clinic" 
                  className="w-9 h-9 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-9 h-9 rounded-xl bg-white text-blue-700 font-black items-center justify-center text-xl shadow">
                  +
                </div>
              </div>
              <div>
                <h2 className="font-bold text-base tracking-tight leading-tight">
                  SS Shifa Clinic
                </h2>
                <p className="text-[11px] text-blue-200/90 font-normal">
                  Clinic Management
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-white/70 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive 
                      ? 'bg-white/20 text-white shadow-sm font-semibold' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0 stroke-[2]" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Logout Item */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-150 text-left"
            >
              <LogOut className="w-5 h-5 shrink-0 stroke-[2]" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Bottom Contact Support Translucent Box */}
        <div className="p-4">
          <div className="bg-white/10 hover:bg-white/15 transition backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">Need Help?</p>
              <p className="text-[11px] text-blue-200/90">Contact Support</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
