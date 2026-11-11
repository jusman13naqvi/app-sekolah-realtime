import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { RekapKategoriSummary, Pengaturan, SiswaScoreRecord, Kelas } from '../types';
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
  Compass,
  Flame,
  ArrowRight,
  BarChart3,
  Calendar,
  Crown,
  Medal,
  AlertTriangle,
  Search,
  School,
  UserCheck,
  Filter,
  Info,
  ShieldAlert,
  HelpCircle,
  Check,
  User,
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
  siswaRanking?: SiswaScoreRecord[];
  kelasList?: Kelas[];
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  disiplin: <ShieldCheck className="w-6 h-6 text-sky-600" />,
  terbersih: <Sparkles className="w-6 h-6 text-teal-600" />,
  kreatif: <Palette className="w-6 h-6 text-cyan-600" />,
  taat_aturan: <CheckCircle className="w-6 h-6 text-blue-600" />,
  berprestasi: <Trophy className="w-6 h-6 text-amber-500" />,
};

const BAR_COLORS = ['#0284c7', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#3b82f6', '#6366f1'];

export const PublicDashboard: React.FC<PublicDashboardProps> = ({
  overview,
  onSelectCategory,
  siswaRanking = [],
  kelasList = [],
}) => {
  const { periode, pengaturan, kategoriSummaries, overallClassScores, terakhirDiperbarui } = overview;
  const [activeViewMode, setActiveViewMode] = useState<'kelas' | 'siswa'>('kelas');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [siswaSearch, setSiswaSearch] = useState<string>('');
  const [showScoringInfo, setShowScoringInfo] = useState(false);

  // Filter students based on selected class and search query
  const filteredStudents = siswaRanking.filter((s) => {
    const matchClass = selectedClassFilter === 'all' || s.kelasId === selectedClassFilter;
    const matchSearch =
      !siswaSearch.trim() ||
      s.nama.toLowerCase().includes(siswaSearch.toLowerCase()) ||
      s.nisn.includes(siswaSearch);
    return matchClass && matchSearch;
  });

  // Top 10 Best Students
  const top10 = filteredStudents.slice(0, 10);
  const top3 = top10.slice(0, 3);
  const ranks4to10 = top10.slice(3, 10);

  // Ranks 11 to 20
  const ranks11to20 = filteredStudents.slice(10, 20);

  // 15 Lowest Students (Warning List)
  const lowest15 = [...filteredStudents]
    .sort((a, b) => {
      if (a.totalPoin !== b.totalPoin) {
        return a.totalPoin - b.totalPoin; // lowest point first
      }
      if (b.totalPelanggaran !== a.totalPelanggaran) {
        return b.totalPelanggaran - a.totalPelanggaran; // most violations first
      }
      return a.nama.localeCompare(b.nama);
    })
    .slice(0, 15);

  return (
    <div className="space-y-10 pb-16">
      {/* HydroFest Hero Section: Fresh Cyan / Ocean Blue Gradient with Wave and Curved Motif */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 text-white shadow-xl shadow-sky-900/10 border border-sky-400/20">
        {/* Soft atmospheric background glow & water ripples */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative Wave SVG at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 opacity-15 pointer-events-none">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto preserve-3d">
            <path
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        <div className="relative z-10 p-7 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            {/* HydroFest Kicker Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></span>
              <span className="tracking-wide uppercase text-[11px] text-cyan-200">Official Evaluation Portal</span>
              <span className="text-white/60">·</span>
              <span className="text-white text-[11px]">{pengaturan.namaSekolah}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-xs">
                {pengaturan.judulDashboard}
              </h1>
              <p className="text-base sm:text-lg text-sky-100 font-medium leading-relaxed max-w-2xl">
                {pengaturan.subjudulDashboard ||
                  'Membangun karakter disiplin, kreativitas, kebersihan, kepatuhan, dan prestasi unggul generasi penerus bangsa.'}
              </p>
            </div>

            {/* Quick Action Highlights / Tags */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-medium text-sky-100">
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>Kedisiplinan 4 Indikator</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-medium text-sky-100">
                <BarChart3 className="w-4 h-4 text-teal-300" />
                <span>Skor Akumulatif Live</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-medium text-sky-100">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Peringkat Mingguan</span>
              </div>
            </div>
          </div>

          {/* HydroFest Event Card: Period & Status Box */}
          <div className="w-full lg:w-auto shrink-0 bg-white/95 backdrop-blur-xl rounded-2xl p-6 text-slate-900 shadow-2xl border border-white/80 space-y-4">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-extrabold text-sky-700 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Periode Penilaian</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Aktif
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xl font-black text-slate-900 block tracking-tight">{periode.nama}</span>
              <p className="text-xs font-semibold text-slate-500">
                {periode.tanggalMulai} s.d. {periode.tanggalSelesai}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Pembaruan:</span>
              <span className="font-bold text-sky-900 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                {terakhirDiperbarui}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* HydroFest Segmented View Switcher: Prestasi Kelas vs Prestasi Siswa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-3xl border border-sky-100 shadow-sm">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveViewMode('kelas')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeViewMode === 'kelas'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Prestasi Kelas</span>
          </button>

          <button
            onClick={() => setActiveViewMode('siswa')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeViewMode === 'siswa'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Siswa Terbaik (Individu)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black">
              Top 10 & Podium
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowScoringInfo(!showScoringInfo)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors shadow-2xs"
          >
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>{showScoringInfo ? 'Tutup Aturan Poin' : 'Sistem 100 Poin Siswa'}</span>
          </button>
        </div>
      </div>

      {/* Info Card: Aturan Penilaian Siswa */}
      {showScoringInfo && (
        <section className="bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 border border-sky-200 rounded-3xl p-6 text-slate-800 shadow-sm animate-fadeIn">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-sky-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Sistem Akumulasi Poin Siswa Terbaik</h3>
                <p className="text-xs text-slate-600">Perhitungan diambil otomatis dari rekapan harian juri dan guru penilai kelas.</p>
              </div>
            </div>
            <button
              onClick={() => setShowScoringInfo(false)}
              className="text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-sky-100 shadow-2xs space-y-1">
              <span className="font-bold text-sky-900 block">Poin Modal Awal:</span>
              <span className="text-2xl font-black text-sky-700 block">100 Poin</span>
              <span className="text-[11px] text-slate-500">Modal poin dasar setiap siswa per periode</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs space-y-1">
              <span className="font-bold text-rose-900 block">Usage Report:</span>
              <span className="text-xl font-black text-rose-600 block">-1 Poin</span>
              <span className="text-[11px] text-slate-500">Jika tidak mengisi usage report harian</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
              <span className="font-bold text-amber-900 block">Kehadiran (Absensi):</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-amber-600">Izin/Sakit: -1 pt</span>
                <span className="text-base font-black text-rose-600">Alpa: -2 pt</span>
              </div>
              <span className="text-[11px] text-slate-500">Pengurangan berdasarkan catatan presensi</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-orange-100 shadow-2xs space-y-1">
              <span className="font-bold text-orange-900 block">Kepatuhan Helm:</span>
              <span className="text-xl font-black text-orange-600 block">-1 Poin</span>
              <span className="text-[11px] text-slate-500">Jika terdata tidak memakai helm standar</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs space-y-1">
              <span className="font-bold text-purple-900 block">Ketepatan Waktu:</span>
              <span className="text-xl font-black text-purple-600 block">-1 Poin</span>
              <span className="text-[11px] text-slate-500">Jika datang terlambat saat masuk sekolah</span>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 1: PRESTASI KELAS (Existing View) */}
      {activeViewMode === 'kelas' && (
        <>
          {/* 5 Main Category Cards - HydroFest Modern Innovation Pillars */}
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-2 text-sky-600 font-extrabold text-xs uppercase tracking-wider mb-1">
                  <Compass className="w-4 h-4" />
                  <span>Pilar Penilaian Siswa</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kategori Prestasi Kelas</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Fokus utama saat ini adalah <strong className="text-sky-700 font-bold">Kelas Disiplin</strong> dengan pemantauan per siswa harian. Kategori lainnya sedang dipersiapkan untuk tahap berikutnya.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {kategoriSummaries.map((summary) => {
                const kat = summary.kategori;
                const top = summary.kelasTertinggi;
                const isAktif = kat.id === 'disiplin' || kat.status === 'aktif';
                const icon = CATEGORY_ICON_MAP[kat.id] || <Award className="w-6 h-6 text-sky-600" />;

                const cardGradient =
                  kat.id === 'disiplin'
                    ? 'from-sky-500 to-blue-600'
                    : kat.id === 'terbersih'
                    ? 'from-teal-500 to-emerald-600'
                    : kat.id === 'kreatif'
                    ? 'from-cyan-500 to-sky-600'
                    : kat.id === 'taat_aturan'
                    ? 'from-blue-600 to-indigo-600'
                    : 'from-amber-500 to-orange-600';

                return (
                  <div
                    key={kat.id}
                    onClick={() => onSelectCategory(kat.id)}
                    className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                      isAktif
                        ? 'border-sky-200 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1.5'
                        : 'border-slate-200/90 bg-slate-50/60 hover:border-slate-300 opacity-90'
                    }`}
                  >
                    {/* HydroFest Accent Top Wave Bar */}
                    <div className={`h-2 w-full bg-gradient-to-r ${cardGradient}`} />

                    <div className="p-5 flex flex-col justify-between h-full space-y-4">
                      {/* Top Icon & Badge */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          {icon}
                        </div>

                        <div>
                          {isAktif ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full">
                              <Lock className="w-3 h-3 text-slate-400" />
                              Tahap 2
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Desc */}
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-sky-600 transition-colors">
                          {kat.nama}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-normal">
                          {kat.deskripsi}
                        </p>
                      </div>

                      {/* Metrics Box */}
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-bold text-slate-500">Rata-rata:</span>
                          <span className="text-2xl font-black text-slate-900 tabular-nums">
                            {isAktif && summary.rataRataKeseluruhan > 0 ? summary.rataRataKeseluruhan : '-'}
                          </span>
                        </div>

                        <div className="bg-sky-50/60 rounded-xl p-2.5 flex items-center justify-between text-xs border border-sky-100/70">
                          <span className="text-[11px] font-semibold text-slate-500">Tertinggi:</span>
                          {isAktif && top ? (
                            <span className="font-bold text-sky-950 bg-white px-2 py-0.5 rounded-lg border border-sky-200 text-xs shadow-2xs">
                              Kelas {top.kelasNama} ({top.rataRata})
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {isAktif ? 'Belum dinilai' : 'Coming Soon'}
                            </span>
                          )}
                        </div>

                        <div className="pt-1 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
                          <span>Lihat Rincian</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Main Charts & Leaderboard Section - HydroFest Style Clean Cards */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overall Composite Class Performance Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Grafik Prestasi Disiplin Antar Kelas
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Visualisasi skor rata-rata perolehan penilaian disiplin mingguan seluruh kelas (skala 0 - 100).
                  </p>
                </div>
                <span className="text-xs bg-sky-50 text-sky-800 font-extrabold px-3.5 py-1.5 rounded-full border border-sky-200/80 self-start sm:self-auto">
                  Skor Disiplin
                </span>
              </div>

              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overallClassScores} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" vertical={false} />
                    <XAxis dataKey="kelasNama" tick={{ fill: '#334155', fontSize: 13, fontWeight: 700 }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: '#f0f9ff' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl text-xs space-y-1.5 border border-slate-800">
                              <p className="font-extrabold text-cyan-300 text-sm">Kelas {data.kelasNama}</p>
                              <p className="text-slate-300">Wali Kelas: {data.waliKelas || '-'}</p>
                              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-4">
                                <span className="text-slate-400">Rata-Rata:</span>
                                <span className="text-lg font-black text-white">{data.overallAvg}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="overallAvg" radius={[10, 10, 4, 4]}>
                      {overallClassScores.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* HydroFest Leaderboard: Podium Ranking */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-5">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Klasemen Kelas</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Peringkat kedisiplinan tertinggi periode ini</p>
                </div>
              </div>

              <div className="space-y-3 max-h-88 overflow-y-auto pr-1">
                {overallClassScores.map((item, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  const badgeStyle =
                    rank === 1
                      ? 'bg-amber-400 text-amber-950 font-black shadow-sm ring-4 ring-amber-100'
                      : rank === 2
                      ? 'bg-slate-200 text-slate-800 font-extrabold shadow-xs'
                      : rank === 3
                      ? 'bg-amber-700 text-white font-extrabold shadow-xs'
                      : 'bg-slate-100 text-slate-600 font-bold';

                  const cardStyle =
                    rank === 1
                      ? 'bg-gradient-to-r from-amber-50/70 via-sky-50/40 to-white border-amber-300/80 shadow-xs'
                      : rank === 2
                      ? 'bg-gradient-to-r from-slate-50 via-white to-white border-slate-200'
                      : rank === 3
                      ? 'bg-gradient-to-r from-orange-50/50 via-white to-white border-orange-200'
                      : 'bg-white border-slate-100 hover:bg-sky-50/40';

                  return (
                    <div
                      key={item.kelasId}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs ${badgeStyle}`}>
                          {rank}
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm block">Kelas {item.kelasNama}</span>
                          <span className="text-[11px] text-slate-500 block font-medium">Wali: {item.waliKelas || '-'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-sky-700 block tabular-nums">
                          {item.overallAvg}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Skor Akhir</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* HydroFest Bottom Feature: Prestasi Highlights */}
          <section className="bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 rounded-3xl p-6 sm:p-8 border border-sky-100 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold text-sky-700 uppercase tracking-wider block">Prestasi Terbaik</span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Pencapaian Tertinggi Kategori</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {kategoriSummaries.map((summary) => {
                const kat = summary.kategori;
                const top = summary.kelasTertinggi;
                const isAktif = kat.id === 'disiplin' || kat.status === 'aktif';

                return (
                  <div
                    key={kat.id}
                    className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between space-y-3 transition-all ${
                      isAktif ? 'border-sky-200 hover:shadow-md' : 'border-slate-200/80 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-sky-50 rounded-xl text-sky-600">
                        {CATEGORY_ICON_MAP[kat.id]}
                      </div>
                      <span className="font-extrabold text-xs text-slate-900 truncate">{kat.nama}</span>
                    </div>

                    {isAktif && top ? (
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-500 block font-semibold">Peringkat 1:</span>
                        <span className="text-xl font-black text-slate-900 block">Kelas {top.kelasNama}</span>
                        <span className="inline-block text-[11px] font-bold text-sky-800 bg-sky-100/70 border border-sky-200 px-2 py-0.5 rounded-full">
                          Rata-rata: {top.rataRata}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs py-3 font-semibold">
                        <AlertCircle className="w-4 h-4 text-slate-400" />
                        <span>Tahap 2</span>
                      </div>
                    )}

                    <button
                      onClick={() => onSelectCategory(kat.id)}
                      className="w-full text-left text-xs font-bold text-sky-600 hover:text-sky-800 pt-2 border-t border-slate-100 flex items-center justify-between"
                    >
                      <span>Buka Rekap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* VIEW 2: PRESTASI SISWA TERBAIK (INDIVIDU) */}
      {activeViewMode === 'siswa' && (
        <div className="space-y-10">
          {/* Header & Filter Bar */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-2 text-sky-600 font-extrabold text-xs uppercase tracking-wider mb-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Kategori Individu Siswa</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Peringkat Siswa Terbaik & Podium Kejuaraan
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Pemeringkatan akumulasi poin kedisiplinan individu (Modal 100 Poin) berdasarkan kepatuhan Usage Report, kehadiran, penggunaan helm, dan ketepatan waktu hadir.
                </p>
              </div>

              {/* Class Filter & Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="pl-8 pr-4 py-2 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 bg-sky-50/50 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                  >
                    <option value="all">Semua Kelas ({siswaRanking.length} Siswa)</option>
                    {kelasList.map((k) => {
                      const count = siswaRanking.filter((s) => s.kelasId === k.id).length;
                      return (
                        <option key={k.id} value={k.id}>
                          Kelas {k.nama} ({count} Siswa)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={siswaSearch}
                    onChange={(e) => setSiswaSearch(e.target.value)}
                    placeholder="Cari siswa / NISN..."
                    className="pl-8 pr-4 py-2 border border-slate-200 rounded-2xl text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Siswa</span>
                <span className="text-2xl font-black text-sky-900 block mt-0.5">{filteredStudents.length}</span>
              </div>
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Poin 100 Sempurna</span>
                <span className="text-2xl font-black text-emerald-800 block mt-0.5">
                  {filteredStudents.filter((s) => s.totalPoin === 100).length} Siswa
                </span>
              </div>
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Rata-Rata Poin</span>
                <span className="text-2xl font-black text-amber-800 block mt-0.5">
                  {filteredStudents.length > 0
                    ? (
                        filteredStudents.reduce((sum, s) => sum + s.totalPoin, 0) / filteredStudents.length
                      ).toFixed(1)
                    : 100}
                </span>
              </div>
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Perlu Pembinaan (&lt;95)</span>
                <span className="text-2xl font-black text-rose-800 block mt-0.5">
                  {filteredStudents.filter((s) => s.totalPoin < 95).length} Siswa
                </span>
              </div>
            </div>
          </section>

          {/* TOP 3 PODIUM SECTION */}
          {top3.length > 0 ? (
            <section className="bg-gradient-to-b from-sky-900 via-blue-900 to-indigo-950 rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden border border-sky-400/20">
              {/* Soft decorative background glows */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center space-y-1 mb-4 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-black uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>The Champions Podium</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                  Top 3 Siswa Berprestasi Terbaik
                </h3>
                <p className="text-xs text-sky-200 max-w-xl mx-auto font-medium">
                  Peraih akumulasi kedisiplinan dan poin tertinggi pada {periode.nama}.
                </p>
              </div>

              {/* PODIUM GRID: RANK 2 (Left), RANK 1 (Center), RANK 3 (Right) */}
              <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2 sm:gap-4 items-end relative z-10 pt-2">
                {/* JUARA 2 (Silver / Perak - Left) */}
                <div className="flex flex-col items-center">
                  {top3[1] ? (
                    <div className="w-full flex flex-col items-center text-center space-y-1.5 pb-2">
                      {/* Avatar with Silver Ring */}
                      <div className="relative group">
                        <div className="relative">
                          {top3[1].fotoUrl ? (
                            <img
                              src={top3[1].fotoUrl}
                              alt={top3[1].nama}
                              className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full object-cover border-2 sm:border-4 border-slate-200 shadow-lg ring-2 sm:ring-4 ring-slate-400/60"
                            />
                          ) : (
                            <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-black text-base sm:text-xl flex items-center justify-center border-2 sm:border-4 border-slate-200 shadow-lg ring-2 sm:ring-4 ring-slate-400/60">
                              {top3[1].nama.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-900 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider border border-white shadow-md flex items-center gap-0.5">
                            <Medal className="w-2.5 h-2.5 text-slate-700" />
                            <span>#2</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[95px] sm:max-w-[150px]">
                          {top3[1].nama}
                        </h4>
                        <span className="inline-block text-[10px] font-bold text-slate-900 bg-slate-200 px-2 py-0.2 rounded-full shadow-2xs">
                          Kelas {top3[1].kelasNama}
                        </span>
                        <div>
                          <span className="text-xs sm:text-base font-black text-cyan-300 block">
                            {top3[1].totalPoin} Poin
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-20 flex items-center justify-center text-white/40 text-xs">Belum ada</div>
                  )}

                  {/* Silver Pedestal */}
                  <div className="w-full bg-gradient-to-t from-slate-500 via-slate-400 to-slate-300 h-20 sm:h-28 md:h-32 rounded-t-2xl sm:rounded-t-3xl border-t-2 border-white/60 shadow-xl flex flex-col items-center justify-center text-slate-900 p-1">
                    <span className="text-2xl sm:text-4xl font-black drop-shadow-xs opacity-90">2</span>
                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-slate-800">
                      Juara II
                    </span>
                  </div>
                </div>

                {/* JUARA 1 (Gold / Emas - Center - Tallest) */}
                <div className="flex flex-col items-center -mt-2 sm:-mt-4">
                  {top3[0] && (
                    <div className="w-full flex flex-col items-center text-center space-y-1.5 pb-2">
                      {/* Floating Crown above Champion */}
                      <div className="animate-bounce">
                        <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-amber-300 drop-shadow-md" />
                      </div>

                      {/* Avatar with Gold Ring */}
                      <div className="relative group">
                        <div className="relative">
                          {top3[0].fotoUrl ? (
                            <img
                              src={top3[0].fotoUrl}
                              alt={top3[0].nama}
                              className="w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-2 sm:border-4 border-amber-300 shadow-xl ring-2 sm:ring-4 ring-amber-400/80"
                            />
                          ) : (
                            <div className="w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-amber-950 font-black text-lg sm:text-2xl flex items-center justify-center border-2 sm:border-4 border-amber-300 shadow-xl ring-2 sm:ring-4 ring-amber-400/80">
                              {top3[0].nama.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border-2 border-white shadow-lg flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-amber-900" />
                            <span>JUARA 1</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-xs sm:text-base text-white truncate max-w-[110px] sm:max-w-[180px]">
                          {top3[0].nama}
                        </h4>
                        <span className="inline-block text-[10px] font-bold text-amber-950 bg-amber-300 px-2.5 py-0.2 rounded-full shadow-2xs">
                          Kelas {top3[0].kelasNama}
                        </span>
                        <div>
                          <span className="text-sm sm:text-lg font-black text-amber-300 block drop-shadow-xs">
                            {top3[0].totalPoin} Poin
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gold Pedestal */}
                  <div className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-300 h-28 sm:h-36 md:h-44 rounded-t-2xl sm:rounded-t-3xl border-t-4 border-amber-200 shadow-xl flex flex-col items-center justify-center text-amber-950 p-1">
                    <span className="text-3xl sm:text-5xl font-black drop-shadow-sm">1</span>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-950">
                      Terbaik I
                    </span>
                  </div>
                </div>

                {/* JUARA 3 (Bronze / Perunggu - Right) */}
                <div className="flex flex-col items-center">
                  {top3[2] ? (
                    <div className="w-full flex flex-col items-center text-center space-y-1.5 pb-2">
                      {/* Avatar with Bronze Ring */}
                      <div className="relative group">
                        <div className="relative">
                          {top3[2].fotoUrl ? (
                            <img
                              src={top3[2].fotoUrl}
                              alt={top3[2].nama}
                              className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full object-cover border-2 sm:border-4 border-amber-600 shadow-lg ring-2 sm:ring-4 ring-amber-700/60"
                            />
                          ) : (
                            <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-600 to-orange-800 text-amber-100 font-black text-base sm:text-xl flex items-center justify-center border-2 sm:border-4 border-amber-600 shadow-lg ring-2 sm:ring-4 ring-amber-700/60">
                              {top3[2].nama.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-700 text-white px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider border border-white shadow-md flex items-center gap-0.5">
                            <Award className="w-2.5 h-2.5 text-amber-300" />
                            <span>#3</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[95px] sm:max-w-[150px]">
                          {top3[2].nama}
                        </h4>
                        <span className="inline-block text-[10px] font-bold text-amber-100 bg-amber-800/80 px-2 py-0.2 rounded-full shadow-2xs">
                          Kelas {top3[2].kelasNama}
                        </span>
                        <div>
                          <span className="text-xs sm:text-base font-black text-cyan-300 block">
                            {top3[2].totalPoin} Poin
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-20 flex items-center justify-center text-white/40 text-xs">Belum ada</div>
                  )}

                  {/* Bronze Pedestal */}
                  <div className="w-full bg-gradient-to-t from-amber-800 via-amber-700 to-amber-600 h-16 sm:h-24 md:h-28 rounded-t-2xl sm:rounded-t-3xl border-t-2 border-amber-400/60 shadow-xl flex flex-col items-center justify-center text-amber-100 p-1">
                    <span className="text-2xl sm:text-4xl font-black drop-shadow-xs opacity-90">3</span>
                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-amber-200">
                      Juara III
                    </span>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-sky-200 space-y-2">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">Belum Ada Data Siswa Terbaik</h3>
              <p className="text-xs text-slate-400">Silakan tambahkan data siswa di panel Admin terlebih dahulu.</p>
            </div>
          )}

          {/* RANKS 4 - 10 SECTION */}
          {ranks4to10.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <Medal className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-normal">
                      Peringkat 4 s.d. 10 Siswa Terbaik
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Jajaran siswa berprestasi dengan rekam kedisiplinan luar biasa sekolah
                  </p>
                </div>
                <span className="text-xs bg-sky-50 text-sky-800 font-extrabold px-3.5 py-1.5 rounded-full border border-sky-200 self-start sm:self-auto shadow-2xs">
                  Top 4 s.d. 10
                </span>
              </div>

              {/* 2-Column Responsive Grid with plenty of room for long names & scores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {ranks4to10.map((s, idx) => {
                  const rank = idx + 4;
                  return (
                    <div
                      key={s.siswaId}
                      className="p-4 sm:p-5 rounded-2xl border border-sky-100 bg-white hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-between gap-3.5 group overflow-hidden"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Rank Badge */}
                        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 text-sky-800 font-black text-sm flex items-center justify-center shrink-0 border border-sky-200 shadow-2xs group-hover:scale-105 transition-transform">
                          #{rank}
                        </span>

                        {/* Photo or Initials Avatar */}
                        <div className="relative shrink-0">
                          {s.fotoUrl ? (
                            <img
                              src={s.fotoUrl}
                              alt={s.nama}
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-200 group-hover:border-sky-400 group-hover:scale-105 transition-all shadow-xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-200 text-sky-800 font-black text-sm flex items-center justify-center border-2 border-sky-200 group-hover:border-sky-400 group-hover:scale-105 transition-all shadow-xs">
                              {s.nama.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Student Name & Class Details */}
                        <div className="min-w-0 flex-1">
                          <h4
                            className="font-extrabold text-sm sm:text-base text-slate-900 truncate group-hover:text-sky-600 transition-colors"
                            title={s.nama}
                          >
                            {s.nama}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                              Kelas {s.kelasNama}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              NISN: {s.nisn}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score and Discipline Indicator */}
                      <div className="text-right shrink-0 pl-3 border-l border-slate-100 flex flex-col items-end justify-center">
                        <span className="text-base sm:text-xl font-black text-sky-700 block tabular-nums leading-none">
                          {s.totalPoin} Poin
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                            s.totalPelanggaran === 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {s.totalPelanggaran === 0 ? 'Bersih (0 Catatan)' : `${s.totalPelanggaran} Catatan`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* RANKS 11 - 20 SECTION */}
          {ranks11to20.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Peringkat 11 s.d. 20 Siswa
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Daftar siswa berprestasi urutan berikutnya</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 font-extrabold px-3 py-1.5 rounded-full">
                  Urutan 11 - 20
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                      <th className="py-3 px-4 text-center w-14">Rank</th>
                      <th className="py-3 px-4 w-12 text-center">Foto</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4 font-mono">NISN</th>
                      <th className="py-3 px-4 text-center">Evaluasi Terdata</th>
                      <th className="py-3 px-4 text-right">Total Poin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ranks11to20.map((s, idx) => {
                      const rank = idx + 11;
                      return (
                        <tr key={s.siswaId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-black text-slate-700 font-mono text-xs">
                            #{rank}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {s.fotoUrl ? (
                              <img
                                src={s.fotoUrl}
                                alt={s.nama}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 inline-block"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs inline-flex items-center justify-center border border-slate-200">
                                {s.nama.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{s.nama}</td>
                          <td className="py-3 px-4">
                            <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded font-bold text-xs">
                              Kelas {s.kelasNama}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-xs">{s.nisn}</td>
                          <td className="py-3 px-4 text-center text-xs text-slate-600 font-medium">
                            {s.totalHariEvaluasi > 0 ? `${s.totalHariEvaluasi} Hari` : 'Reguler'}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-sky-700 tabular-nums">
                            {s.totalPoin} Poin
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 15 SISWA PERINGKAT TERENDAH (WARNING / RED INDICATOR) */}
          <section className="bg-gradient-to-br from-rose-50 via-red-50/40 to-amber-50/50 rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-600/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-rose-950 tracking-tight flex items-center gap-2">
                    <span>15 Siswa Peringkat Terendah</span>
                    <span className="text-[10px] uppercase font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">
                      Perlu Perhatian & Pembinaan
                    </span>
                  </h3>
                  <p className="text-xs text-rose-800/80 mt-0.5">
                    Daftar siswa dengan pengurangan poin terbesar untuk rujukan pembinaan bimbingan konseling (BK) dan tindak lanjut wali kelas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs bg-white text-rose-800 font-extrabold px-3 py-1 rounded-full border border-rose-300 shadow-2xs">
                  Sistem Peringkat Bawah
                </span>
              </div>
            </div>

            {lowest15.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-rose-100/70 text-rose-900 text-xs uppercase font-extrabold border-b border-rose-200">
                      <th className="py-3 px-4 text-center w-12">No</th>
                      <th className="py-3 px-3 text-center w-14">Foto</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4 text-center">Poin Sisa</th>
                      <th className="py-3 px-4">Rincian Pengurangan Catatan</th>
                      <th className="py-3 px-4 text-center w-36">Status Pembinaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/80 bg-white/70">
                    {lowest15.map((s, idx) => {
                      const deductions = 100 - s.totalPoin;
                      const hasViolation = deductions > 0;

                      return (
                        <tr key={s.siswaId} className="hover:bg-rose-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-rose-900 text-xs font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {s.fotoUrl ? (
                              <img
                                src={s.fotoUrl}
                                alt={s.nama}
                                className="w-9 h-9 rounded-full object-cover border-2 border-rose-300 inline-block"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-800 font-bold text-xs inline-flex items-center justify-center border border-rose-300">
                                {s.nama.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-slate-900 block text-xs sm:text-sm">{s.nama}</span>
                            <span className="text-[10px] text-slate-500 font-mono">NISN: {s.nisn}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-white border border-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded text-xs">
                              Kelas {s.kelasNama}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`text-sm font-black px-2.5 py-0.5 rounded-full border ${
                                  s.totalPoin < 90
                                    ? 'bg-rose-600 text-white border-rose-700'
                                    : s.totalPoin < 95
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                }`}
                              >
                                {s.totalPoin} Poin
                              </span>
                              {hasViolation && (
                                <span className="text-[10px] text-rose-600 font-extrabold mt-0.5">
                                  (-{deductions} pt)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              {s.rincian.tidakIsiUsageReport > 0 && (
                                <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold border border-rose-200">
                                  Usage: {s.rincian.tidakIsiUsageReport}x (-{s.rincian.tidakIsiUsageReport})
                                </span>
                              )}
                              {s.rincian.alpa > 0 && (
                                <span className="bg-red-200 text-red-900 px-2 py-0.5 rounded font-black border border-red-300">
                                  Alpa: {s.rincian.alpa}x (-{s.rincian.alpa * 2})
                                </span>
                              )}
                              {(s.rincian.izin > 0 || s.rincian.sakit > 0) && (
                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold border border-amber-200">
                                  Izin/Sakit: {s.rincian.izin + s.rincian.sakit}x (-{s.rincian.izin + s.rincian.sakit})
                                </span>
                              )}
                              {s.rincian.tidakPakaiHelm > 0 && (
                                <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold border border-orange-200">
                                  Helm: {s.rincian.tidakPakaiHelm}x (-{s.rincian.tidakPakaiHelm})
                                </span>
                              )}
                              {s.rincian.terlambat > 0 && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold border border-purple-200">
                                  Telat: {s.rincian.terlambat}x (-{s.rincian.terlambat})
                                </span>
                              )}
                              {!hasViolation && (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Belum ada catatan pelanggaran
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {s.totalPoin < 90 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Perlu BK</span>
                              </span>
                            ) : s.totalPoin < 95 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                                <span>Perhatian</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                <span>Aman</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-rose-700 font-medium text-xs">
                Tidak ada data siswa yang memenuhi kriteria pencarian.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
