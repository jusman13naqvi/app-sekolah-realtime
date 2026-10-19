import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { User, Pengaturan } from '../types';
import { LayoutDashboard, Award, LogIn, LogOut, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  currentView: 'dashboard' | 'detail' | 'login' | 'guru' | 'admin';
  onNavigate: (view: 'dashboard' | 'detail' | 'login' | 'guru' | 'admin') => void;
  currentUser: User | null;
  onLogout: () => void;
  activePeriodeName: string;
  settings: Pengaturan;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  activePeriodeName,
  settings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white border-b border-indigo-800/40 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand & Custom Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 group text-left focus:outline-none shrink-0 transition-transform active:scale-95"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo Sekolah"
              className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1 border border-white/20 shadow-xs"
            />
          ) : (
            <SchoolLogo size={38} />
          )}

          <div className="hidden sm:flex flex-col">
            <span className="text-base font-bold text-white tracking-tight leading-tight group-hover:text-blue-300 transition-colors">
              {settings.namaSekolah || 'SMP Negeri 7 Muara Badak'}
            </span>
            <span className="text-xs text-blue-200/80 font-normal">
              {settings.judulDashboard || 'Dashboard Prestasi Kelas'}
            </span>
          </div>
        </button>

        {/* Zone 2: Professional Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-200">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentView === 'dashboard'
                ? 'bg-blue-600/40 text-white font-bold border border-blue-400/50 shadow-sm'
                : 'hover:text-white hover:bg-white/10 text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span>Dashboard Publik</span>
          </button>

          {currentUser?.role === 'guru' || currentUser?.role === 'admin' ? (
            <button
              onClick={() => onNavigate('guru')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentView === 'guru'
                  ? 'bg-emerald-600/40 text-white font-bold border border-emerald-400/50 shadow-sm'
                  : 'hover:text-white hover:bg-white/10 text-slate-300'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Input Penilaian Juri</span>
            </button>
          ) : null}

          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentView === 'admin'
                  ? 'bg-indigo-600/40 text-white font-bold border border-indigo-400/50 shadow-sm'
                  : 'hover:text-white hover:bg-white/10 text-slate-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Panel Administrator</span>
            </button>
          ) : null}
        </nav>

        {/* Zone 3: User Profile & Session Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:block text-right pr-3 border-r border-indigo-800/60">
            <span className="block text-[11px] text-blue-200/70 font-medium">Periode Aktif</span>
            <span className="block text-xs font-extrabold text-amber-300 tracking-wide">{activePeriodeName}</span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">{currentUser.nama}</span>
                <span className="text-[10px] text-emerald-400 uppercase font-extrabold tracking-wider">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Juri / Guru Penilai'}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Keluar / Logout"
                className="p-2 text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition-all flex items-center gap-1 text-xs border border-transparent hover:border-rose-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-semibold">Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Juri / Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
