import React from 'react';
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
      {/* Hero Header Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <SchoolLogo size={68} className="shrink-0 bg-slate-900/80 p-2 rounded-2xl border border-slate-700 shadow-inner" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {pengaturan.namaSekolah}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {pengaturan.judulDashboard}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
                {pengaturan.subjudulDashboard}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 shadow-lg shrink-0 w-full md:w-auto">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>PERIODE PENILAIAN MINGGUAN</span>
            </div>
            <p className="text-base font-bold text-blue-300">{periode.nama}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {periode.tanggalMulai} s.d. {periode.tanggalSelesai}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Pembaruan:</span>
              <span className="font-semibold text-slate-200">{terakhirDiperbarui}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Main Category Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Kategori Prestasi Kelas</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Penilaian yang sedang berlangsung saat ini adalah <strong>Kelas Disiplin</strong>. Kategori lainnya berada dalam status Coming Soon (Tahap 2).
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

            return (
              <div
                key={kat.id}
                onClick={() => onSelectCategory(kat.id)}
                className={`bg-white rounded-xl p-5 border shadow-sm text-left transition-all duration-200 flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                  isAktif
                    ? 'border-amber-400/80 hover:-translate-y-1 hover:shadow-lg ring-2 ring-amber-400/30'
                    : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 opacity-90'
                }`}
              >
                {/* Status Badge Top Right */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  {isAktif ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Penilaian Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full shadow-2xs">
                      <Lock className="w-2.5 h-2.5" />
                      Coming Soon
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      {icon}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {kat.nama}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                      {kat.deskripsi}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-medium text-slate-500">Rata-rata:</span>
                    <span className="text-lg font-black text-slate-900 tabular-nums">
                      {isAktif && summary.rataRataKeseluruhan > 0 ? summary.rataRataKeseluruhan : '-'}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2 flex items-center justify-between text-xs border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500">Tertinggi:</span>
                    {isAktif && top ? (
                      <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shadow-2xs">
                        Kelas {top.kelasNama} ({top.rataRata})
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        {isAktif ? 'Belum ada data' : 'Pengembangan Tahap 2'}
                      </span>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs text-blue-600 font-semibold hover:underline">
                    <span>Lihat Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Grafik Prestasi Disiplin Seluruh Kelas</span>
              </h3>
              <p className="text-xs text-slate-500">
                Nilai rata-rata akumulatif kelas pada kategori Kelas Disiplin minggu ini.
              </p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2.5 py-1 rounded-md border border-amber-200 self-start sm:self-auto">
              Skala 0 - 100
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallClassScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="kelasNama" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                          <p className="font-bold text-blue-300">Kelas {data.kelasNama}</p>
                          <p className="text-slate-300">Wali Kelas: {data.waliKelas || '-'}</p>
                          <p className="text-amber-300 font-semibold text-sm pt-1">
                            Rata-Rata Disiplin: {data.overallAvg}
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Peringkat Disiplin Kelas</h3>
              <p className="text-xs text-slate-500">Klasemen akumulatif minggu ini</p>
            </div>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {overallClassScores.map((item, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const badgeBg =
                rank === 1
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : rank === 2
                  ? 'bg-slate-300 text-slate-900 font-bold'
                  : rank === 3
                  ? 'bg-amber-700 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 font-medium';

              return (
                <div
                  key={item.kelasId}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    isTop3 ? 'bg-slate-50/80 border-slate-200' : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${badgeBg}`}>
                      {rank}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Kelas {item.kelasNama}</span>
                      <span className="text-[11px] text-slate-500 block">{item.waliKelas || 'SMPN 7'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-blue-700 block tabular-nums">
                      {item.overallAvg}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Skor Disiplin</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Summary Highlights */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pencapaian Tertinggi Kategori</h2>
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
                className={`rounded-xl p-4 border flex flex-col justify-between space-y-3 ${
                  isAktif ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      {CATEGORY_ICON_MAP[kat.id]}
                    </div>
                    <span className="font-bold text-xs text-slate-800 line-clamp-1">{kat.nama}</span>
                  </div>
                </div>

                {isAktif && top ? (
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 block">Juara Disiplin:</span>
                    <span className="text-xl font-black text-blue-900 block">Kelas {top.kelasNama}</span>
                    <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Rata-rata: {top.rataRata}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-700 text-xs italic py-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Coming Soon (Tahap 2)</span>
                  </div>
                )}

                <button
                  onClick={() => onSelectCategory(kat.id)}
                  className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline pt-2 border-t border-slate-200/60"
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
