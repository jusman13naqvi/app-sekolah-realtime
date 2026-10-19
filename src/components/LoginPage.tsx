import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { Lock, User as UserIcon, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
      <div className="max-w-md w-full space-y-6 bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-2xl relative overflow-hidden">
        {/* Subtle accent backdrop blur */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Branding */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex justify-center p-3.5 bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 text-white rounded-2xl shadow-lg ring-4 ring-blue-500/10">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
            ) : (
              <SchoolLogo size={54} />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Akses Sistem Penilaian
            </h2>
            <p className="text-xs font-semibold text-blue-700 mt-1">
              {settings.namaSekolah || 'SMP Negeri 7 Muara Badak'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 shadow-2xs relative z-10">
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
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
                placeholder="Masukkan username"
                className="block w-full pl-10 pr-3 py-2.5 text-sm font-medium border border-slate-300 rounded-xl bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
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
                className="block w-full pl-10 pr-10 py-2.5 text-sm font-medium border border-slate-300 rounded-xl bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
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
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 mt-2 active:scale-98"
          >
            {isSubmitting ? 'Memproses Login...' : 'Masuk ke Sistem'}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-500 leading-relaxed pt-3 border-t border-slate-100 font-medium relative z-10">
          Sistem Penilaian Prestasi Kelas &copy; {settings.namaSekolah}.<br />
          Akun dibuat secara resmi oleh Administrator Sekolah.
        </p>
      </div>
    </div>
  );
};
