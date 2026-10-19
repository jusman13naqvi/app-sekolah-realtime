import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { RekapKategoriSummary, Pengaturan } from '../types';
import {
  ShieldCheck,
  Sparkles,import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { RekapKategoriSummary, Pengaturan } from '../types';
import {
  ShieldCheck,
  Sparkles,
  Palette,
  CheckCircle,
  Trophy,
  ChevronRight,
  Clock,
  Award,
  AlertCircle,
  TrendingUp,
  Lock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PublicDashboardProps {
  overview: {
    periode: { nama: string; tanggalMulai: string; tanggalSelesai: string };
    pengaturan: Pengaturan;
    kategoriSummaries: RekapKategoriSummary[];
    overallClassScores: Array<{
      kelasId: string;
      kelasNama: string;
      waliKelas?: string;
      overallAvg: number;
      categoriesCount: number;
    }>;
    terakhirDiperbarui: string;
  };
  onSelectCategory: (kategoriId: string) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  disiplin: <ShieldCheck className="w-6 h-6 text-amber-500" />,
  terbersih: <Sparkles className="w-6 h-6 text-emerald-500" />,
  kreatif: <Palette className="w-6 h-6 text-purple-500" />,
  taat_aturan: <CheckCircle className="w-6 h-6 text-blue-500" />,
  berprestasi: <Trophy className="w-6 h-6 text-rose-500" />,
};

const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const PublicDashboard: React.FC<PublicDashboardProps> = ({ overview, onSelectCategory }) => {
  const { periode, pengaturan, kategoriSummaries, overallClassScores, terakhirDiperbarui } = overview;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header Section - Fresh Royal Indigo Gradient */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {pengaturan.logoUrl ? (
              <img
                src={pengaturan.logoUrl}
                alt="Logo Sekolah"
                className="w-16 h-16 object-contain shrink-0 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/25 shadow-md"
              />
            ) : (
              <SchoolLogo size={68} className="shrink-0 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/25 shadow-md" />
            )}
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 drop-shadow-xs">
                {pengaturan.namaSekolah}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                {pengaturan.judulDashboard}
              </h1>
              <p className="text-sm text-blue-100/90 max-w-2xl leading-relaxed font-medium">
                {pengaturan.subjudulDashboard}
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 shadow-lg shrink-0 w-full md:w-auto text-white">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>PERIODE PENILAIAN MINGGUAN</span>
            </div>
            <p className="text-base font-extrabold text-amber-300">{periode.nama}</p>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              {periode.tanggalMulai} s.d. {periode.tanggalSelesai}
            </p>
            <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-200">
              <span>Pembaruan Terakhir:</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{terakhirDiperbarui}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Main Category Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Kategori Prestasi Kelas</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Penilaian yang sedang berlangsung saat ini adalah <strong className="text-blue-700 font-bold">Kelas Disiplin</strong>. Kategori lainnya berada dalam status Coming Soon (Tahap 2).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kategoriSummaries.map((summary) => {
            const kat = summary.kategori;
            const top = summary.kelasTertinggi;
            // Kelas Disiplin is ALWAYS active & being evaluated!
            const isAktif = kat.id === 'disiplin' || kat.status === 'aktif';
            const icon = CATEGORY_ICON_MAP[kat.id] || <Award className="w-6 h-6 text-blue-500" />;

            const stripeGradient =
              kat.id === 'disiplin'
                ? 'from-blue-600 to-indigo-600'
                : kat.id === 'terbersih'
                ? 'from-emerald-500 to-teal-600'
                : kat.id === 'kreatif'
                ? 'from-purple-500 to-pink-600'
                : kat.id === 'taat_aturan'
                ? 'from-cyan-500 to-blue-600'
                : 'from-amber-500 to-rose-600';

            return (
              <div
                key={kat.id}
                onClick={() => onSelectCategory(kat.id)}
                className={`bg-white rounded-2xl border shadow-sm text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                  isAktif
                    ? 'border-emerald-500/80 hover:-translate-y-1 hover:shadow-xl ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90 bg-slate-50/80 hover:border-slate-300 opacity-90'
                }`}
              >
                {/* Colorful top stripe */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${stripeGradient}`} />

                <div className="p-5 flex flex-col justify-between h-full space-y-4">
                  {/* Status Badge Top Right */}
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shadow-2xs">
                      {icon}
                    </div>
                    <div>
                      {isAktif ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300/80 px-2.5 py-1 rounded-full shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Penilaian Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-300/80 px-2.5 py-1 rounded-full shadow-2xs">
                          <Lock className="w-3 h-3 text-amber-600" />
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {kat.nama}
                    </h3>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-normal">
                      {kat.deskripsi}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Rata-rata:</span>
                      <span className="text-xl font-black text-blue-900 tabular-nums">
                        {isAktif && summary.rataRataKeseluruhan > 0 ? summary.rataRataKeseluruhan : '-'}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2 flex items-center justify-between text-xs border border-slate-200/70">
                      <span className="text-[11px] font-medium text-slate-500">Tertinggi:</span>
                      {isAktif && top ? (
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                          Kelas {top.kelasNama} ({top.rataRata})
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {isAktif ? 'Belum ada data' : 'Pengembangan Tahap 2'}
                        </span>
                      )}
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs text-blue-600 font-bold hover:text-blue-800">
                      <span>Lihat Detail</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Charts & Overall Class Rankings Split */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Composite Class Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Grafik Prestasi Disiplin Seluruh Kelas</span>
              </h3>
              <p className="text-xs text-slate-500">
                Nilai rata-rata akumulatif kelas pada kategori Kelas Disiplin minggu ini.
              </p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-800 font-bold px-3 py-1 rounded-xl border border-blue-200/80 self-start sm:self-auto">
              Skala 0 - 100
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallClassScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="kelasNama" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-1 border border-slate-700">
                          <p className="font-extrabold text-amber-300 text-sm">Kelas {data.kelasNama}</p>
                          <p className="text-slate-300 font-medium">Wali Kelas: {data.waliKelas || '-'}</p>
                          <p className="text-blue-300 font-bold text-sm pt-1">
                            Rata-Rata Disiplin: <span className="text-white text-base font-black">{data.overallAvg}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="overallAvg" radius={[8, 8, 0, 0]}>
                  {overallClassScores.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Leaderboard List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Peringkat Disiplin Kelas</h3>
              <p className="text-xs text-slate-500">Klasemen akumulatif minggu ini</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {overallClassScores.map((item, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const badgeBg =
                rank === 1
                  ? 'bg-amber-400 text-amber-950 font-black ring-2 ring-amber-300/80 shadow-xs'
                  : rank === 2
                  ? 'bg-slate-300 text-slate-900 font-extrabold shadow-xs'
                  : rank === 3
                  ? 'bg-amber-700 text-white font-extrabold shadow-xs'
                  : 'bg-slate-100 text-slate-700 font-semibold';

              const rowBg =
                rank === 1
                  ? 'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border-amber-300/80'
                  : rank === 2
                  ? 'bg-gradient-to-r from-slate-100/70 via-white to-slate-50 border-slate-300/80'
                  : rank === 3
                  ? 'bg-gradient-to-r from-orange-50/50 via-white to-orange-50/30 border-orange-200/80'
                  : 'bg-white border-slate-100 hover:bg-slate-50';

              return (
                <div
                  key={item.kelasId}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${rowBg}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${badgeBg}`}>
                      {rank}
                    </span>
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">Kelas {item.kelasNama}</span>
                      <span className="text-[11px] text-slate-500 block font-medium">{item.waliKelas || 'SMPN 7'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-blue-700 block tabular-nums">
                      {item.overallAvg}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Skor Disiplin</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Summary Highlights */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Pencapaian Tertinggi Kategori</h2>
            <p className="text-xs text-slate-500">Kelas unggulan terbaik minggu ini berdasarkan status kategori</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {kategoriSummaries.map((summary) => {
            const kat = summary.kategori;
            const top = summary.kelasTertinggi;
            const isAktif = kat.id === 'disiplin' || kat.status === 'aktif';

            return (
              <div
                key={kat.id}
                className={`rounded-2xl p-4 border flex flex-col justify-between space-y-3 transition-all ${
                  isAktif
                    ? 'bg-gradient-to-b from-emerald-50/70 to-white border-emerald-300 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      {CATEGORY_ICON_MAP[kat.id]}
                    </div>
                    <span className="font-extrabold text-xs text-slate-900 line-clamp-1">{kat.nama}</span>
                  </div>
                </div>

                {isAktif && top ? (
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-medium block">Juara Disiplin:</span>
                    <span className="text-xl font-black text-blue-950 block">Kelas {top.kelasNama}</span>
                    <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-md">
                      Rata-rata: {top.rataRata}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold italic py-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Coming Soon (Tahap 2)</span>
                  </div>
                )}

                <button
                  onClick={() => onSelectCategory(kat.id)}
                  className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline pt-2 border-t border-slate-200/60"
                >
                  Lihat Rekap &rarr;
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

  Palette,
  CheckCircle,
  Trophy,
  ChevronRight,
  Clock,
  Award,
  AlertCircle,
  TrendingUp,
  Lock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PublicDashboardProps {
  overview: {
    periode: { nama: string; tanggalMulai: string; tanggalSelesai: string };
    pengaturan: Pengaturan;
    kategoriSummaries: RekapKategoriSummary[];
    overallClassScores: Array<{
      kelasId: string;
      kelasNama: string;
      waliKelas?: string;
      overallAvg: number;
      categoriesCount: number;
    }>;
    terakhirDiperbarui: string;
  };
  onSelectCategory: (kategoriId: string) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  disiplin: <ShieldCheck className="w-6 h-6 text-amber-500" />,
  terbersih: <Sparkles className="w-6 h-6 text-emerald-500" />,
  kreatif: <Palette className="w-6 h-6 text-purple-500" />,
  taat_aturan: <CheckCircle className="w-6 h-6 text-blue-500" />,
  berprestasi: <Trophy className="w-6 h-6 text-rose-500" />,
};

const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const PublicDashboard: React.FC<PublicDashboardProps> = ({ overview, onSelectCategory }) => {
  const { periode, pengaturan, kategoriSummaries, overallClassScores, terakhirDiperbarui } = overview;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header Section - Fresh Royal Indigo Gradient */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <SchoolLogo size={68} className="shrink-0 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/25 shadow-md" />
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 drop-shadow-xs">
                {pengaturan.namaSekolah}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                {pengaturan.judulDashboard}
              </h1>
              <p className="text-sm text-blue-100/90 max-w-2xl leading-relaxed font-medium">
                {pengaturan.subjudulDashboard}
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 shadow-lg shrink-0 w-full md:w-auto text-white">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>PERIODE PENILAIAN MINGGUAN</span>
            </div>
            <p className="text-base font-extrabold text-amber-300">{periode.nama}</p>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              {periode.tanggalMulai} s.d. {periode.tanggalSelesai}
            </p>
            <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-200">
              <span>Pembaruan Terakhir:</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{terakhirDiperbarui}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Main Category Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Kategori Prestasi Kelas</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Penilaian yang sedang berlangsung saat ini adalah <strong className="text-blue-700 font-bold">Kelas Disiplin</strong>. Kategori lainnya berada dalam status Coming Soon (Tahap 2).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kategoriSummaries.map((summary) => {
            const kat = summary.kategori;
            const top = summary.kelasTertinggi;
            // Kelas Disiplin is ALWAYS active & being evaluated!
            const isAktif = kat.id === 'disiplin' || kat.status === 'aktif';
            const icon = CATEGORY_ICON_MAP[kat.id] || <Award className="w-6 h-6 text-blue-500" />;

            const stripeGradient =
              kat.id === 'disiplin'
                ? 'from-blue-600 to-indigo-600'
                : kat.id === 'terbersih'
                ? 'from-emerald-500 to-teal-600'
                : kat.id === 'kreatif'
                ? 'from-purple-500 to-pink-600'
                : kat.id === 'taat_aturan'
                ? 'from-cyan-500 to-blue-600'
                : 'from-amber-500 to-rose-600';

            return (
              <div
                key={kat.id}
                onClick={() => onSelectCategory(kat.id)}
                className={`bg-white rounded-2xl border shadow-sm text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                  isAktif
                    ? 'border-emerald-500/80 hover:-translate-y-1 hover:shadow-xl ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90 bg-slate-50/80 hover:border-slate-300 opacity-90'
                }`}
              >
                {/* Colorful top stripe */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${stripeGradient}`} />

                <div className="p-5 flex flex-col justify-between h-full space-y-4">
                  {/* Status Badge Top Right */}
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shadow-2xs">
                      {icon}
                    </div>
                    <div>
                      {isAktif ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300/80 px-2.5 py-1 rounded-full shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Penilaian Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-300/80 px-2.5 py-1 rounded-full shadow-2xs">
                          <Lock className="w-3 h-3 text-amber-600" />
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {kat.nama}
                    </h3>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-normal">
                      {kat.deskripsi}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Rata-rata:</span>
                      <span className="text-xl font-black text-blue-900 tabular-nums">
                        {isAktif && summary.rataRataKeseluruhan > 0 ? summary.rataRataKeseluruhan : '-'}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2 flex items-center justify-between text-xs border border-slate-200/70">
                      <span className="text-[11px] font-medium text-slate-500">Tertinggi:</span>
                      {isAktif && top ? (
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                          Kelas {top.kelasNama} ({top.rataRata})
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {isAktif ? 'Belum ada data' : 'Pengembangan Tahap 2'}
                        </span>
                      )}
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs text-blue-600 font-bold hover:text-blue-800">
                      <span>Lihat Detail</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Charts & Overall Class Rankings Split */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Composite Class Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Grafik Prestasi Disiplin Seluruh Kelas</span>
              </h3>
              <p className="text-xs text-slate-500">
                Nilai rata-rata akumulatif kelas pada kategori Kelas Disiplin minggu ini.
              </p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-800 font-bold px-3 py-1 rounded-xl border border-blue-200/80 self-start sm:self-auto">
              Skala 0 - 100
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallClassScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="kelasNama" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-1 border border-slate-700">
                          <p className="font-extrabold text-amber-300 text-sm">Kelas {data.kelasNama}</p>
                          <p className="text-slate-300 font-medium">Wali Kelas: {data.waliKelas || '-'}</p>
                          <p className="text-blue-300 font-bold text-sm pt-1">
                            Rata-Rata Disiplin: <span className="text-white text-base font-black">{data.overallAvg}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="overallAvg" radius={[8, 8, 0, 0]}>
                  {overallClassScores.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Leaderboard List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Peringkat Disiplin Kelas</h3>
              <p className="text-xs text-slate-500">Klasemen akumulatif minggu ini</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {overallClassScores.map((item, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const badgeBg =
                rank === 1
                  ? 'bg-amber-400 text-amber-950 font-black ring-2 ring-amber-300/80 shadow-xs'
                  : rank === 2
                  ? 'bg-slate-300 text-slate-900 font-extrabold shadow-xs'
                  : rank === 3
                  ? 'bg-amber-700 text-white font-extrabold shadow-xs'
                  : 'bg-slate-100 text-slate-700 font-semibold';

              const rowBg =
                rank === 1
                  ? 'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border-amber-300/80'
                  : rank === 2
                  ? 'bg-gradient-to-r from-slate-100/70 via-white to-slate-50 border-slate-300/80'
                  : rank === 3
                  ? 'bg-gradient-to-r from-orange-50/50 via-white to-orange-50/30 border-orange-200/80'
                  : 'bg-white border-slate-100 hover:bg-slate-50';

              return (
                <div
                  key={item.kelasId}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${rowBg}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${badgeBg}`}>
                      {rank}
                    </span>
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">Kelas {item.kelasNama}</span>
                      <span className="text-[11px] text-slate-500 block font-medium">{item.waliKelas || 'SMPN 7'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-blue-700 block tabular-nums">
                      {item.overallAvg}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Skor Disiplin</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Summary Highlights */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Pencapaian Tertinggi Kategori</h2>
            <p className="text-xs text-slate-500">Kelas unggulan terbaik minggu ini berdasarkan status kategori</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {kategoriSummaries.map((summary) => {
            const kat = summary.kategori;
            const top = summary.kelasTertinggi;
            const isAktif = kat.id === 'disiplin' || kat.status === 'aktif';

            return (
              <div
                key={kat.id}
                className={`rounded-2xl p-4 border flex flex-col justify-between space-y-3 transition-all ${
                  isAktif
                    ? 'bg-gradient-to-b from-emerald-50/70 to-white border-emerald-300 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      {CATEGORY_ICON_MAP[kat.id]}
                    </div>
                    <span className="font-extrabold text-xs text-slate-900 line-clamp-1">{kat.nama}</span>
                  </div>
                </div>

                {isAktif && top ? (
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-medium block">Juara Disiplin:</span>
                    <span className="text-xl font-black text-blue-950 block">Kelas {top.kelasNama}</span>
                    <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-md">
                      Rata-rata: {top.rataRata}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold italic py-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Coming Soon (Tahap 2)</span>
                  </div>
                )}

                <button
                  onClick={() => onSelectCategory(kat.id)}
                  className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline pt-2 border-t border-slate-200/60"
                >
                  Lihat Rekap &rarr;
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
