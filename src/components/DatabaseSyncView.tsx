import React from 'react';
import { Database, Wifi, ShieldCheck, RefreshCw, CheckCircle2, Server, Layers, Users, School, UserCheck, FileSpreadsheet } from 'lucide-react';

interface DatabaseSyncViewProps {
  usersCount: number;
  kelasListCount: number;
  siswaListCount: number;
  penilaianListCount: number;
  lastUpdated: string;
}

export const DatabaseSyncView: React.FC<DatabaseSyncViewProps> = ({
  usersCount,
  kelasListCount,
  siswaListCount,
  penilaianListCount,
  lastUpdated,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Database Realtime Online (Firestore)</h2>
            <p className="text-xs text-slate-500">
              Aplikasi ini terhubung langsung ke Firebase Firestore Cloud Database tanpa Apps Script atau Sheets.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>Status: Terhubung & Realtime</span>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-500">Pengguna / Juri</span>
            <span className="text-lg font-extrabold text-slate-900">{usersCount} Akun</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg">
            <School className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-500">Daftar Kelas</span>
            <span className="text-lg font-extrabold text-slate-900">{kelasListCount} Kelas</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-500">Total Siswa Terdaftar</span>
            <span className="text-lg font-extrabold text-slate-900">{siswaListCount} Siswa</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-500">Total Entri Penilaian</span>
            <span className="text-lg font-extrabold text-slate-900">{penilaianListCount} Entri</span>
          </div>
        </div>
      </div>

      {/* Synchronized Features Info */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-lg border border-slate-800">
        <h3 className="text-sm font-bold flex items-center gap-2 text-blue-300">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <span>Keunggulan Sistem Realtime Online</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <strong className="text-white block font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Synchronized Multi-Device
            </strong>
            <p className="text-slate-400 text-[11px]">
              Setiap kali juri menyimpan penilaian dari HP/Laptop, hasil penilaian langsung ter-update otomatis di HP/Laptop lain tanpa harus refresh browser.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <strong className="text-white block font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Keamanan & Validasi Server
            </strong>
            <p className="text-slate-400 text-[11px]">
              Data tersimpan aman di cloud Firebase dengan aturan validasi Firestore Rules resmi yang mencegah duplikasi dan akses ilegal.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <strong className="text-white block font-bold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Reaktif & Tanpa Lag
            </strong>
            <p className="text-slate-400 text-[11px]">
              Perubahan nama sekolah, logo, data siswa, hingga reset password guru langsung diterapkan detik itu juga secara global.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
