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
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand & Custom Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 group text-left focus:outline-none shrink-0"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo Sekolah"
              className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1 border border-slate-700"
            />
          ) : (
            <SchoolLogo size={38} />
          )}

          <div className="hidden sm:flex flex-col">
            <span className="text-base font-bold text-white tracking-tight leading-tight group-hover:text-blue-300 transition-colors">
              {settings.namaSekolah || 'SMP Negeri 7 Muara Badak'}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {settings.judulDashboard || 'Dashboard Prestasi Kelas'}
            </span>
          </div>
        </button>

        {/* Zone 2: Professional Navigation Links (No Apps Script button) */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-300">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentView === 'dashboard'
                ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30'
                : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Publik</span>
          </button>

          {currentUser?.role === 'guru' || currentUser?.role === 'admin' ? (
            <button
              onClick={() => onNavigate('guru')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentView === 'guru'
                  ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Input Penilaian Juri</span>
            </button>
          ) : null}

          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentView === 'admin'
                  ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Panel Administrator</span>
            </button>
          ) : null}
        </nav>

        {/* Zone 3: User Profile & Session Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:block text-right pr-2 border-r border-slate-700">
            <span className="block text-[11px] text-slate-400 font-medium">Periode Aktif</span>
            <span className="block text-xs font-semibold text-blue-300">{activePeriodeName}</span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white leading-tight">{currentUser.nama}</span>
                <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Juri / Guru Penilai'}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Keluar / Logout"
                className="p-2 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
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
