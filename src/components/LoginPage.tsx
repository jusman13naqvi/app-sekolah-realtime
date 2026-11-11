import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { Lock, User as UserIcon, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { Pengaturan } from '../types';

interface LoginPageProps {
  onLogin: (username: string, pass: string) => void;
  errorMessage?: string | null;
  settings: Pengaturan;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, errorMessage, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setIsSubmitting(true);
    onLogin(username, password);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white rounded-3xl border border-sky-100 shadow-xl shadow-sky-950/5 p-8 sm:p-10 relative overflow-hidden">
        {/* HydroFest Style Ambient Backdrop Highlights */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Branding */}
        <div className="text-center space-y-3.5 relative z-10">
          <div className="inline-flex justify-center p-3.5 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg shadow-sky-500/20 ring-4 ring-sky-500/10">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
            ) : (
              <SchoolLogo size={48} className="shrink-0" />
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Portal Akses Resmi</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Akses Sistem Penilaian
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {settings.namaSekolah || 'SMP Negeri 7 Muara Badak'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-start gap-3 shadow-2xs relative z-10">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Gagal Masuk:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username Pengguna
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <UserIcon className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username akun"
                className="block w-full pl-10 pr-3.5 py-3 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kata Sandi / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="block w-full pl-10 pr-10 py-3 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 hover:from-sky-400 hover:to-blue-600 text-white font-extrabold text-sm rounded-full shadow-lg shadow-sky-500/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 mt-2 active:scale-98"
          >
            {isSubmitting ? 'Memproses Login...' : 'Masuk ke Portal'}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 leading-relaxed pt-4 border-t border-slate-100 font-medium relative z-10">
          Sistem Penilaian Prestasi Kelas &copy; {settings.namaSekolah}.<br />
          Akun dibuat dan dikelola resmi oleh Administrator Sekolah.
        </p>
      </div>
    </div>
  );
};
