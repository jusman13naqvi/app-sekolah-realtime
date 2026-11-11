import React, { useState } from 'react';
import { RekapKategoriSummary, Penilaian } from '../types';
import {
  ArrowLeft,
  Trophy,
  Award,
  Calendar,
  AlertTriangle,
  FileText,
  User,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface CategoryDetailProps {
  summary: RekapKategoriSummary;
  allEvaluations: Penilaian[];
  onBack: () => void;
}

export const CategoryDetail: React.FC<CategoryDetailProps> = ({ summary, allEvaluations, onBack }) => {
  const { kategori, rataRataKeseluruhan, kelasTertinggi, totalPenilaianMasuk, rekapKelas, isPeringkatFinal } = summary;
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  const isAktif = kategori.status === 'aktif';

  const categoryEvaluations = allEvaluations.filter(
    (p) => p.kategoriId === kategori.id && (selectedClassFilter === 'all' || p.kelasId === selectedClassFilter)
  );

  const chartData = rekapKelas.map((item) => ({
    kelasNama: item.kelasNama,
    rataRata: item.rataRata || 0,
    jumlah: item.jumlahPenilaian,
  }));

  const dateMap: Record<string, { tanggal: string; sum: number; count: number }> = {};
  categoryEvaluations.forEach((p) => {
    if (!dateMap[p.tanggal]) {
      dateMap[p.tanggal] = { tanggal: p.tanggal, sum: 0, count: 0 };
    }
    dateMap[p.tanggal].sum += p.nilai;
    dateMap[p.tanggal].count += 1;
  });

  const dailyTrendData = Object.values(dateMap)
    .map((d) => ({
      tanggal: d.tanggal,
      rataRataHarian: Number((d.sum / d.count).toFixed(2)),
      jumlahData: d.count,
    }))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  return (
    <div className="space-y-8 pb-12">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-sky-100 hover:border-sky-300 hover:text-sky-700 px-4 py-2.5 rounded-full shadow-2xs transition-all self-start active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-sky-600" />
          <span>Kembali ke Dashboard Utama</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-sky-50/70 border border-sky-100 px-3.5 py-1.5 rounded-full font-medium">
          <Calendar className="w-3.5 h-3.5 text-sky-600" />
          <span>Total Penilaian: <strong className="text-slate-900 font-bold">{totalPenilaianMasuk} Data</strong></span>
        </div>
      </div>

      {/* Category Hero Banner - HydroFest Style Ocean Wave Box */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 text-white rounded-3xl p-7 sm:p-9 shadow-lg border border-sky-400/20 space-y-4">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-3.5 py-1 rounded-full text-xs font-bold border border-white/20">
              <Award className="w-3.5 h-3.5 text-cyan-300" />
              <span>Detail Kategori Penilaian</span>
              {!isAktif && (
                <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] uppercase">
                  Tahap 2
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">{kategori.nama}</h1>
            <p className="text-sky-100 text-sm leading-relaxed">{kategori.deskripsi}</p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 text-slate-900 shadow-xl border border-white/80 shrink-0 text-center min-w-[170px] space-y-1">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
              RATA-RATA TOTAL
            </span>
            <span className="text-3xl font-black text-sky-700 block tabular-nums">
              {rataRataKeseluruhan > 0 ? rataRataKeseluruhan : '-'}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold block">Skala 0 - 100</span>
          </div>
        </div>

        {!isAktif && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-sky-100 p-3.5 rounded-2xl flex items-center gap-3 text-xs">
            <Sparkles className="w-5 h-5 text-cyan-300 shrink-0" />
            <span>
              <strong>Informasi Pengembangan:</strong> Kategori ini dijadwalkan aktif pada pengembangan Tahap 2. Saat ini seluruh juri berfokus penuh pada kategori <strong>Kelas Disiplin</strong>.
            </span>
          </div>
        )}

        {isAktif && !isPeringkatFinal && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-sky-100 p-3 rounded-2xl flex items-center gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
            <span>
              <strong>Catatan:</strong> Peringkat bersifat dinamis dan diperbarui otomatis secara realtime saat juri menginput penilaian harian.
            </span>
          </div>
        )}
      </div>

      {/* Main Class Recap Table */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Rekapitulasi Nilai Seluruh Kelas</h2>
            <p className="text-xs text-slate-500">
              Urutan kelas berdasarkan hasil rata-rata akumulasi penilaian juri.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <th className="py-3.5 px-4 text-center w-16">Peringkat</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4 text-center">Jumlah Juri/Data</th>
                <th className="py-3.5 px-4 text-right">Rata-Rata Mingguan</th>
                <th className="py-3.5 px-4 text-center">Status Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rekapKelas.map((item) => {
                const isWinner = item.peringkat === 1 && item.rataRata !== null && isAktif;

                return (
                  <tr
                    key={item.kelasId}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isWinner ? 'bg-amber-50/50 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      {isAktif && item.peringkat ? (
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                            item.peringkat === 1
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : item.peringkat === 2
                              ? 'bg-slate-200 text-slate-800'
                              : item.peringkat === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.peringkat}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Kelas {item.kelasNama}</span>
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                            <Trophy className="w-3 h-3 text-amber-600" />
                            Juara Disiplin
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums text-slate-600">
                      {item.jumlahPenilaian} Entri
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isAktif && item.rataRata !== null ? (
                        <span className="text-base font-black text-blue-700 tabular-nums">
                          {item.rataRata}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          {isAktif ? 'Belum ada data' : 'Coming Soon'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md ${
                          item.statusKelengkapan === 'Lengkap'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.statusKelengkapan === 'Lengkap' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {item.statusKelengkapan}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Visual Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Perbandingan Nilai Antarkelas</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="kelasNama" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="rataRata" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Rata-rata Nilai" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Perkembangan Nilai Harian</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rataRataHarian"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Rata-rata Harian"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Daily Evaluation Log History */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Riwayat Penilaian Harian Juri</h2>
            <p className="text-xs text-slate-500">Daftar entri penilaian harian dari masing-masing juri penilai</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kelas</option>
              {rekapKelas.map((k) => (
                <option key={k.kelasId} value={k.kelasId}>
                  Kelas {k.kelasNama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {categoryEvaluations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryEvaluations.map((evalItem) => (
              <div
                key={evalItem.id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Kelas {evalItem.kelasNama}</span>
                  <span className="text-base font-black text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs tabular-nums">
                    {evalItem.nilai}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tanggal: {evalItem.tanggal}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Penilai: {evalItem.guruNama}</span>
                  </p>
                </div>

                {evalItem.disiplinDetail && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1 font-mono">
                    <p>Usage Report: {evalItem.disiplinDetail.usageReport.skor}%</p>
                    <p>Kehadiran: {evalItem.disiplinDetail.kehadiran.skor}</p>
                    <p>Pakai Helm: {evalItem.disiplinDetail.helm.skor}%</p>
                    <p>Tepat Waktu: {evalItem.disiplinDetail.terlambat.skor}%</p>
                  </div>
                )}

                {evalItem.catatan && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Catatan Juri
                    </span>
                    <p className="italic">{evalItem.catatan}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 space-y-2">
            <p className="text-sm">Tidak ada riwayat penilaian untuk filter kelas ini.</p>
          </div>
        )}
      </section>
    </div>
  );
};
