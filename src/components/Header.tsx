import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { User, Pengaturan } from '../types';
import { LayoutDashboard, Award, LogIn, LogOut, ShieldAlert, Sparkles } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Zone 1: HydroFest Style Brand Logo & Typography */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3.5 group text-left focus:outline-none shrink-0 transition-transform active:scale-98"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo Sekolah"
              className="w-11 h-11 object-contain rounded-2xl bg-sky-50/80 p-1.5 border border-sky-200/80 shadow-xs"
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center">
              <SchoolLogo size={36} className="shrink-0" />
            </div>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                {settings.namaSekolah || 'SMP Negeri 7 Muara Badak'}
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
                Official
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block"></span>
              {settings.judulDashboard || 'Dashboard Prestasi Kelas'}
            </span>
          </div>
        </button>

        {/* Zone 2: HydroFest Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-600">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              currentView === 'dashboard'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold shadow-sm shadow-sky-500/30'
                : 'hover:text-sky-600 hover:bg-sky-50/70 text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard Publik</span>
          </button>

          {currentUser?.role === 'guru' || currentUser?.role === 'admin' ? (
            <button
              onClick={() => onNavigate('guru')}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                currentView === 'guru'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-extrabold shadow-sm shadow-emerald-500/30'
                  : 'hover:text-teal-600 hover:bg-teal-50/70 text-slate-600'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Input Penilaian Juri</span>
            </button>
          ) : null}

          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-extrabold shadow-sm shadow-indigo-500/30'
                  : 'hover:text-indigo-600 hover:bg-indigo-50/70 text-slate-600'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Panel Administrator</span>
            </button>
          ) : null}
        </nav>

        {/* Zone 3: HydroFest Period Chip & User Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/80 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <div className="text-left">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block leading-none">Periode</span>
              <span className="text-xs font-bold text-sky-900 leading-tight block">{activePeriodeName}</span>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-1.5 rounded-full pl-3">
              <div className="hidden sm:flex flex-col text-right pr-2">
                <span className="text-xs font-bold text-slate-900 leading-tight">{currentUser.nama}</span>
                <span className="text-[10px] text-sky-700 uppercase font-extrabold tracking-wider">
                  {currentUser.role === 'admin' ? 'Admin' : 'Juri'}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Keluar / Logout"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all flex items-center gap-1 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-semibold">Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 hover:from-sky-400 hover:to-blue-600 text-white font-bold text-xs rounded-full shadow-md shadow-sky-500/25 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Juri / Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
