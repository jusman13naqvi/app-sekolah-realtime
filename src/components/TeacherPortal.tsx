import React, { useState, useEffect } from 'react';
import { User, Kelas, Kategori, Periode, Penilaian, Siswa, SiswaDisiplinRecord, PenilaianDisiplinDetail } from '../types';
import { computeDisiplinScore } from '../services/dataStore';
import {
  Award,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  Check,
  X,
  ShieldAlert,
  Clock,
  Sparkles,
  FileCheck,
  Calendar,
  Search,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface TeacherPortalProps {
  currentUser: User;
  kelasList: Kelas[];
  kategoriList: Kategori[];
  activePeriode: Periode;
  teacherEvaluations: Penilaian[];
  allEvaluations?: Penilaian[];
  getSiswaByKelas: (kelasId: string) => Siswa[];
  onSubmitPenilaianDisiplin: (data: {
    tanggal: string;
    kelasId: string;
    disiplinDetail: PenilaianDisiplinDetail;
    catatan?: string;
  }) => Promise<{ success: boolean; message: string }>;
  onUpdatePenilaian: (
    id: string,
    nilaiBaru: number,
    catatanBaru: string,
    alasan: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  currentUser,
  kelasList,
  kategoriList,
  activePeriode,
  teacherEvaluations,
  allEvaluations,
  getSiswaByKelas,
  onSubmitPenilaianDisiplin,
  onUpdatePenilaian,
}) => {
  // Navigation Sidebar Tab State
  const [activeTab, setActiveTab] = useState<'input' | 'rekap' | 'riwayat'>('input');

  // Base State
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kelasId, setKelasId] = useState<string>(kelasList[0]?.id || '7a');
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>('disiplin');
  const [catatan, setCatatan] = useState<string>('');
  const [hasSavedData, setHasSavedData] = useState<boolean>(false);

  // Student Roster Checklist State
  const [studentRoster, setStudentRoster] = useState<SiswaDisiplinRecord[]>([]);

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<Penilaian | null>(null);
  const [editNilai, setEditNilai] = useState<number>(85);
  const [editCatatan, setEditCatatan] = useState<string>('');
  const [editAlasan, setEditAlasan] = useState<string>('');

  // Weekly Student Breakdown Modal State (Senin - Sabtu)
  const [activeWeeklyModalIndicator, setActiveWeeklyModalIndicator] = useState<
    'usageReport' | 'kehadiran' | 'helm' | 'terlambat' | null
  >(null);
  const [weeklyModalSearch, setWeeklyModalSearch] = useState('');

  // Auto-Load Saved Evaluation Data or Reset to Default
  useEffect(() => {
    const classStudents = getSiswaByKelas(kelasId);
    if (classStudents.length === 0) {
      setStudentRoster([]);
      setCatatan('');
      setHasSavedData(false);
      return;
    }

    const evalsToSearch = allEvaluations || teacherEvaluations;
    const existingEval = evalsToSearch.find(
      (e) => e.tanggal === tanggal && e.kelasId === kelasId && e.kategoriId === 'disiplin'
    );

    if (existingEval && existingEval.disiplinDetail?.siswaDetail && existingEval.disiplinDetail.siswaDetail.length > 0) {
      const savedMap = new Map(existingEval.disiplinDetail.siswaDetail.map((rec) => [rec.siswaId, rec]));
      setStudentRoster(
        classStudents.map((s) => {
          const rec = savedMap.get(s.id);
          if (rec) {
            return {
              siswaId: s.id,
              nama: s.nama,
              nisn: s.nisn,
              statusKehadiran: rec.statusKehadiran || 'Hadir',
              isiUsageReport: rec.isiUsageReport ?? true,
              pakaiHelm: rec.pakaiHelm ?? true,
              tepatWaktu: rec.tepatWaktu ?? true,
            };
          }
          return {
            siswaId: s.id,
            nama: s.nama,
            nisn: s.nisn,
            statusKehadiran: 'Hadir',
            isiUsageReport: true,
            pakaiHelm: true,
            tepatWaktu: true,
          };
        })
      );
      setCatatan(existingEval.catatan || '');
      setHasSavedData(true);
    } else {
      setStudentRoster(
        classStudents.map((s) => ({
          siswaId: s.id,
          nama: s.nama,
          nisn: s.nisn,
          statusKehadiran: 'Hadir',
          isiUsageReport: true,
          pakaiHelm: true,
          tepatWaktu: true,
        }))
      );
      setCatatan('');
      setHasSavedData(false);
    }
  }, [kelasId, tanggal, teacherEvaluations, allEvaluations, getSiswaByKelas]);

  // Derived Counts
  const totalSiswa = studentRoster.length;
  const hadirCount = studentRoster.filter((s) => s.statusKehadiran === 'Hadir').length;
  const izinCount = studentRoster.filter((s) => s.statusKehadiran === 'Izin').length;
  const sakitCount = studentRoster.filter((s) => s.statusKehadiran === 'Sakit').length;
  const alpaCount = studentRoster.filter((s) => s.statusKehadiran === 'Alpa').length;

  const usageReportMengisiCount = studentRoster.filter((s) => s.isiUsageReport).length;
  const helmPatuhCount = studentRoster.filter((s) => s.pakaiHelm).length;
  const tepatWaktuCount = studentRoster.filter((s) => s.tepatWaktu).length;

  // Live Disiplin Score Calculation
  const computedDisiplin = computeDisiplinScore(
    { totalSiswa, mengisi: usageReportMengisiCount },
    { hadir: hadirCount, izin: izinCount, sakit: sakitCount, alpa: alpaCount },
    { totalSiswa, patuh: helmPatuhCount },
    { totalSiswa, tepatWaktu: tepatWaktuCount }
  );

  // Per-student handlers
  const handleAttendanceChange = (siswaId: string, newStatus: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa') => {
    setStudentRoster((prev) =>
      prev.map((s) => (s.siswaId === siswaId ? { ...s, statusKehadiran: newStatus } : s))
    );
  };

  const handleUsageReportToggle = (siswaId: string) => {
    setStudentRoster((prev) =>
      prev.map((s) => (s.siswaId === siswaId ? { ...s, isiUsageReport: !s.isiUsageReport } : s))
    );
  };

  const handleHelmToggle = (siswaId: string) => {
    setStudentRoster((prev) =>
      prev.map((s) => (s.siswaId === siswaId ? { ...s, pakaiHelm: !s.pakaiHelm } : s))
    );
  };

  const handleTepatWaktuToggle = (siswaId: string) => {
    setStudentRoster((prev) =>
      prev.map((s) => (s.siswaId === siswaId ? { ...s, tepatWaktu: !s.tepatWaktu } : s))
    );
  };

  // Bulk handlers
  const handleBulkAttendance = (status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa') => {
    setStudentRoster((prev) => prev.map((s) => ({ ...s, statusKehadiran: status })));
  };

  const handleBulkUsageReport = (val: boolean) => {
    setStudentRoster((prev) => prev.map((s) => ({ ...s, isiUsageReport: val })));
  };

  const handleBulkHelm = (val: boolean) => {
    setStudentRoster((prev) => prev.map((s) => ({ ...s, pakaiHelm: val })));
  };

  const handleBulkTepatWaktu = (val: boolean) => {
    setStudentRoster((prev) => prev.map((s) => ({ ...s, tepatWaktu: val })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const fullDetail: PenilaianDisiplinDetail = {
        ...computedDisiplin,
        siswaDetail: studentRoster,
      };

      const res = await onSubmitPenilaianDisiplin({
        tanggal,
        kelasId,
        disiplinDetail: fullDetail,
        catatan,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Penilaian Disiplin Kelas ${kelasList.find((k) => k.id === kelasId)?.nama} berhasil disimpan oleh ${currentUser.nama}!`,
        });
        setCatatan('');
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menyimpan penilaian.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editAlasan.trim()) {
      alert('Wajib memasukkan alasan perubahan nilai untuk keperluan audit log!');
      return;
    }

    try {
      const res = await onUpdatePenilaian(editingItem.id, Number(editNilai), editCatatan, editAlasan);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Data penilaian berhasil diperbaiki!' });
        setEditingItem(null);
      } else {
        alert(res.message);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui nilai.');
    }
  };

  // Build 6-Day Dates (Senin - Sabtu) for active period
  const getPeriodDays = () => {
    const start = new Date(activePeriode.tanggalMulai || '2026-10-12');
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return dayNames.map((name, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      return { dayName: name, dateIso: iso };
    });
  };

  const periodDays = getPeriodDays();
  const currentClassStudents = getSiswaByKelas(kelasId);

  const selectedKategoriObj = kategoriList.find((k) => k.id === selectedKategoriId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-12">
      {/* SIDEBAR NAVIGATION JURI / GURU */}
      <aside className="w-full lg:w-64 shrink-0 space-y-4">
        {/* Juri Info Card */}
        <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-800/40 shadow-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-base border border-amber-400/30">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">{currentUser.nama}</h2>
              <span className="text-[10px] text-amber-300 font-extrabold bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-full inline-block mt-0.5">
                Juri / Guru Penilai
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-300 pt-3 border-t border-indigo-800/60 space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-blue-200/70 font-medium">Periode Aktif:</span>
              <span className="text-amber-300 font-bold truncate max-w-[120px]">{activePeriode.nama}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-blue-200/70 font-medium">Total Penilaian:</span>
              <span className="bg-blue-900/80 text-blue-200 px-2.5 py-0.5 rounded-lg font-mono font-bold border border-blue-700/50">
                {teacherEvaluations.length} Kelas
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 space-y-1">
          <p className="text-[10px] uppercase font-extrabold text-slate-400 px-3 py-1.5 tracking-wider">
            Menu Utama Juri
          </p>

          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'input'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className={`w-4 h-4 ${activeTab === 'input' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Input Penilaian</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'input' ? 'text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rekap')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'rekap'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className={`w-4 h-4 ${activeTab === 'rekap' ? 'text-white' : 'text-purple-600'}`} />
              <span>Rekapitulasi 1 Minggu</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'rekap' ? 'text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'riwayat'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileCheck className={`w-4 h-4 ${activeTab === 'riwayat' ? 'text-white' : 'text-blue-600'}`} />
              <span>Riwayat Penilaian Saya</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'riwayat' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {teacherEvaluations.length}
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg border border-slate-800 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold border border-amber-400/30 mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Sistem Penilaian Juri / Guru</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Penilaian Kategori Disiplin Berdasarkan Siswa
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Penilai: <strong className="text-amber-300">{currentUser.nama}</strong> ({currentUser.username})
              </p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs shrink-0 space-y-1">
              <span className="text-slate-400 block font-semibold">Periode Penilaian Aktif:</span>
              <span className="text-blue-300 font-bold block">{activePeriode.nama}</span>
            </div>
          </div>
        </div>

        {/* VIEW 1: INPUT PENILAIAN */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Category Picker Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex gap-2 overflow-x-auto">
              {kategoriList.map((kat) => {
                const isSelected = selectedKategoriId === kat.id;
                const isDisiplin = kat.id === 'disiplin';

                return (
                  <button
                    key={kat.id}
                    type="button"
                    onClick={() => setSelectedKategoriId(kat.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{kat.nama}</span>
                    {!isDisiplin && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-semibold">
                        Coming Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* If Coming Soon Category Selected */}
            {selectedKategoriId !== 'disiplin' ? (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                    Pengembangan Tahap 2
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 pt-2">
                    Kategori {selectedKategoriObj?.nama} (Coming Soon)
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pengembangan saat ini difokuskan secara mendalam pada struktur <strong>Penilaian Kelas Disiplin</strong> dengan 4 indikator seragam berbasis per-siswa.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedKategoriId('disiplin')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  Kembali ke Penilaian Disiplin
                </button>
              </section>
            ) : (
              /* DISIPLIN FORM SECTION */
              <section className="space-y-6">
                {feedback && (
                  <div
                    className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
                      feedback.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="font-bold block text-sm">
                        {feedback.type === 'success' ? 'Berhasil Disimpan' : 'Peringatan'}
                      </strong>
                      <span>{feedback.message}</span>
                    </div>
                  </div>
                )}

                {/* SAVED DATA INDICATOR BANNER */}
                {hasSavedData && (
                  <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl text-xs flex items-center gap-2.5 text-amber-900 shadow-2xs">
                    <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Data Penilaian Tersimpan Ditemukan:</strong> Memuat hasil penilaian yang sudah pernah diinput untuk <strong>Kelas {kelasList.find((k) => k.id === kelasId)?.nama}</strong> pada tanggal <strong>{tanggal}</strong>. Anda dapat mengubah isian di bawah ini untuk memperbarui nilai.
                    </span>
                  </div>
                )}

          {/* Form Header Controls: Date & Class Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Penilaian
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Kelas yang Dinilai
                </label>
                <select
                  value={kelasId}
                  onChange={(e) => setKelasId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      Kelas {k.nama} (Wali: {k.waliKelas || '-'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* LIVE COMPUTED DISCIPLINE SUMMARY CARD - INTERACTIVE CLICKABLE BOXES FOR 6-DAY RECAP */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-500/30 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 block mb-1">
                  RINGKASAN SKOR AKUMULASI KELAS (LIVE)
                </span>
                <h2 className="text-2xl font-black text-white">
                  Kelas {kelasList.find((k) => k.id === kelasId)?.nama}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Klik salah satu kotak indikator di bawah ini untuk melihat <strong>Rekapitulasi 1 Minggu (Senin s.d. Sabtu)</strong> per siswa!
                </p>
              </div>

              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 text-center shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  NILAI AKHIR DISIPLIN
                </span>
                <span className="text-3xl font-black text-amber-400 tabular-nums block">
                  {computedDisiplin.skorTotalDisiplin}
                </span>
                <span className="text-[10px] text-blue-300 font-semibold block mt-0.5">
                  Skala 0 - 100
                </span>
              </div>
            </div>

            {/* 4 Clickable Sub-Indicators Grid (Opening 6-Day Student Recap Modal) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* 1. Usage Report */}
              <button
                type="button"
                onClick={() => setActiveWeeklyModalIndicator('usageReport')}
                className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-xl border border-slate-700 hover:border-amber-400 text-left transition-all group space-y-1 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">1. Usage Report</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                </div>
                <span className="text-2xl font-black text-amber-300 tabular-nums block">
                  {computedDisiplin.usageReport.skor}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {usageReportMengisiCount} / {totalSiswa} Siswa Mengisi
                </span>
                <span className="text-[10px] text-amber-400 font-bold block pt-1 group-hover:underline">
                  Klik Rekap 1 Minggu (Senin-Sabtu) &rarr;
                </span>
              </button>

              {/* 2. Kehadiran */}
              <button
                type="button"
                onClick={() => setActiveWeeklyModalIndicator('kehadiran')}
                className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-xl border border-slate-700 hover:border-emerald-400 text-left transition-all group space-y-1 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">2. Kehadiran</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <span className="text-2xl font-black text-emerald-400 tabular-nums block">
                  {computedDisiplin.kehadiran.skor}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  H:{hadirCount} | I:{izinCount} (-1) | S:{sakitCount} (-1) | A:{alpaCount} (-2)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold block pt-1 group-hover:underline">
                  Klik Rekap 1 Minggu (Senin-Sabtu) &rarr;
                </span>
              </button>

              {/* 3. Pakai Helm */}
              <button
                type="button"
                onClick={() => setActiveWeeklyModalIndicator('helm')}
                className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-xl border border-slate-700 hover:border-blue-400 text-left transition-all group space-y-1 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">3. Pakai Helm</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-2xl font-black text-blue-300 tabular-nums block">
                  {computedDisiplin.helm.skor}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {helmPatuhCount} / {totalSiswa} Siswa Patuh
                </span>
                <span className="text-[10px] text-blue-300 font-bold block pt-1 group-hover:underline">
                  Klik Rekap 1 Minggu (Senin-Sabtu) &rarr;
                </span>
              </button>

              {/* 4. Ketepatan Waktu */}
              <button
                type="button"
                onClick={() => setActiveWeeklyModalIndicator('terlambat')}
                className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-xl border border-slate-700 hover:border-purple-400 text-left transition-all group space-y-1 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">4. Ketepatan Waktu</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                </div>
                <span className="text-2xl font-black text-purple-300 tabular-nums block">
                  {computedDisiplin.terlambat.skor}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {tepatWaktuCount} / {totalSiswa} Tepat Waktu
                </span>
                <span className="text-[10px] text-purple-300 font-bold block pt-1 group-hover:underline">
                  Klik Rekap 1 Minggu (Senin-Sabtu) &rarr;
                </span>
              </button>
            </div>
          </div>

          {/* STUDENT ROSTER CHECKLIST TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Daftar Nama Siswa Kelas {kelasList.find((k) => k.id === kelasId)?.nama}
                </h3>
                <p className="text-xs text-slate-500">
                  Lakukan penilaian langsung per siswa untuk 4 indikator disiplin.
                </p>
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleBulkUsageReport(true)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5" /> Semua Isi Usage
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAttendance('Hadir')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  Semua Hadir
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkHelm(true)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  Semua Helm
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkTepatWaktu(true)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  Semua Tepat Waktu
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                    <th className="py-3 px-3 text-center w-12">NO</th>
                    <th className="py-3 px-3">NAMA SISWA</th>
                    <th className="py-3 px-3">NISN</th>
                    <th className="py-3 px-3 text-center">1. USAGE REPORT?</th>
                    <th className="py-3 px-3 text-center">2. KEHADIRAN</th>
                    <th className="py-3 px-3 text-center">3. PAKAI HELM?</th>
                    <th className="py-3 px-3 text-center">4. TEPAT WAKTU?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentRoster.map((siswa, idx) => (
                    <tr key={siswa.siswaId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-500 text-xs font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 text-xs">{siswa.nama}</td>
                      <td className="py-3 px-3 text-slate-500 text-xs font-mono">{siswa.nisn}</td>

                      {/* 1. Usage Report Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleUsageReportToggle(siswa.siswaId)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all inline-flex items-center gap-1 ${
                            siswa.isiUsageReport
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {siswa.isiUsageReport ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-amber-600" />
                              <span>Ya</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-rose-600" />
                              <span>Tidak</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 2. Kehadiran Selector */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                          {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as const).map((st) => {
                            const isCurrent = siswa.statusKehadiran === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleAttendanceChange(siswa.siswaId, st)}
                                className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                                  isCurrent
                                    ? st === 'Hadir'
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : st === 'Izin'
                                      ? 'bg-amber-500 text-white shadow-2xs'
                                      : st === 'Sakit'
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : 'bg-rose-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* 3. Helm Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleHelmToggle(siswa.siswaId)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all inline-flex items-center gap-1 ${
                            siswa.pakaiHelm
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {siswa.pakaiHelm ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ya</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-rose-600" />
                              <span>Tidak</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 4. Punctuality Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTepatWaktuToggle(siswa.siswaId)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all inline-flex items-center gap-1 ${
                            siswa.tepatWaktu
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {siswa.tepatWaktu ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-purple-600" />
                              <span>Tepat</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-rose-600" />
                              <span>Terlambat</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Catatan & Submit Form Action */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / Komentar Tambahan Juri
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan khusus Juri mengenai kedisiplinan kelas hari ini..."
                className="w-full text-sm border border-slate-300 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan Penilaian...' : 'Simpan Penilaian Disiplin Juri'}</span>
              </button>
            </div>
          </div>
              </section>
            )}
          </div>
        )}

        {/* VIEW 2: REKAPITULASI 1 MINGGU (SENIN S.D. SABTU) */}
        {activeTab === 'rekap' && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Rekapitulasi Pelanggaran 1 Minggu (Senin - Sabtu)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pantau catatan kedisiplinan harian siswa selama 6 hari kerja untuk mendeteksi pelanggaran berulang.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Pilih Kelas:</span>
                <select
                  value={kelasId}
                  onChange={(e) => setKelasId(e.target.value)}
                  className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold text-slate-900"
                >
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      Kelas {k.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Indicator Selector Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { key: 'usageReport', label: '1. Usage Report' },
                  { key: 'kehadiran', label: '2. Kehadiran' },
                  { key: 'helm', label: '3. Pakai Helm' },
                  { key: 'terlambat', label: '4. Ketepatan Waktu' },
                ].map((ind) => (
                  <button
                    key={ind.key}
                    type="button"
                    onClick={() => setActiveWeeklyModalIndicator(ind.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      (activeWeeklyModalIndicator || 'usageReport') === ind.key
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Cari siswa..."
                  value={weeklyModalSearch}
                  onChange={(e) => setWeeklyModalSearch(e.target.value)}
                  className="pl-8 pr-3 py-1 border border-slate-300 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* 6-Day Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-xs uppercase font-bold border-b border-slate-300">
                    <th className="py-3 px-3 text-center w-10">NO</th>
                    <th className="py-3 px-3 min-w-[160px]">NAMA SISWA</th>
                    {periodDays.map((d) => (
                      <th key={d.dayName} className="py-3 px-2 text-center font-bold">
                        <span className="block">{d.dayName}</span>
                        <span className="text-[10px] text-slate-500 font-normal block font-mono">
                          {d.dateIso.slice(8, 10)} Oct
                        </span>
                      </th>
                    ))}
                    <th className="py-3 px-3 text-center min-w-[120px]">TOTAL CATATAN</th>
                    <th className="py-3 px-3 text-center min-w-[140px]">STATUS EVALUASI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentClassStudents
                    .filter((s) => s.nama.toLowerCase().includes(weeklyModalSearch.toLowerCase()))
                    .map((siswa, sIdx) => {
                      let violationCount = 0;
                      const activeInd = activeWeeklyModalIndicator || 'usageReport';

                      const dayCells = periodDays.map((d) => {
                        const evalForDay = (allEvaluations || teacherEvaluations).find(
                          (ev) => ev.tanggal === d.dateIso && ev.kelasId === kelasId
                        );

                        const studentRec = evalForDay?.disiplinDetail?.siswaDetail?.find(
                          (sr) => sr.siswaId === siswa.id || sr.nama === siswa.nama
                        );

                        if (activeInd === 'usageReport') {
                          const isMengisi = studentRec ? studentRec.isiUsageReport : true;
                          if (!isMengisi) violationCount++;
                          return {
                            label: isMengisi ? '✓' : '❌',
                            bad: !isMengisi,
                            detail: isMengisi ? 'Mengisi' : 'Tidak Mengisi',
                          };
                        } else if (activeInd === 'kehadiran') {
                          const st = studentRec ? studentRec.statusKehadiran : 'Hadir';
                          if (st !== 'Hadir') violationCount++;
                          return {
                            label: st === 'Hadir' ? 'H' : st === 'Izin' ? 'I' : st === 'Sakit' ? 'S' : 'A',
                            bad: st === 'Alpa',
                            warning: st === 'Izin' || st === 'Sakit',
                            detail: st,
                          };
                        } else if (activeInd === 'helm') {
                          const isHelm = studentRec ? studentRec.pakaiHelm : true;
                          if (!isHelm) violationCount++;
                          return {
                            label: isHelm ? '✓' : '❌',
                            bad: !isHelm,
                            detail: isHelm ? 'Pakai Helm' : 'Tidak Helm',
                          };
                        } else {
                          const isTepat = studentRec ? studentRec.tepatWaktu : true;
                          if (!isTepat) violationCount++;
                          return {
                            label: isTepat ? '✓' : '❌',
                            bad: !isTepat,
                            detail: isTepat ? 'Tepat Waktu' : 'Terlambat',
                          };
                        }
                      });

                      const hasHighViolation = violationCount >= 2;

                      return (
                        <tr
                          key={siswa.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            hasHighViolation ? 'bg-rose-50/40 font-medium' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-slate-500 text-xs font-mono">{sIdx + 1}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 text-xs block">{siswa.nama}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">{siswa.nisn}</span>
                          </td>

                          {dayCells.map((c, dIdx) => (
                            <td key={dIdx} className="py-2.5 px-2 text-center text-xs">
                              <span
                                title={c.detail}
                                className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                  c.bad
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : c.warning
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {c.label}
                              </span>
                            </td>
                          ))}

                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums ${
                                violationCount > 0
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {violationCount} Kali
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center text-xs">
                            {violationCount >= 2 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                Perlu Perhatian
                              </span>
                            ) : violationCount === 1 ? (
                              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Catatan Ringan
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Sangat Baik
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* VIEW 3: RIWAYAT PENILAIAN SAYA */}
        {activeTab === 'riwayat' && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Riwayat Penilaian Disiplin Saya</h3>
                <p className="text-xs text-slate-500">Daftar entri penilaian yang Anda simpan pada periode ini</p>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                {teacherEvaluations.length} Entri
              </span>
            </div>

            {teacherEvaluations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4 text-center">Nilai Total</th>
                      <th className="py-3 px-4">Detail Breakdown</th>
                      <th className="py-3 px-4 text-center">Aksi Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teacherEvaluations.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600 text-xs font-mono">{item.tanggal}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">Kelas {item.kelasNama}</td>
                        <td className="py-3 px-4 text-center font-black text-blue-700 tabular-nums text-base">
                          {item.nilai}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {item.disiplinDetail ? (
                            <span>
                              Usage: {item.disiplinDetail.usageReport.skor}% | Kehadiran: {item.disiplinDetail.kehadiran.skor} | Helm: {item.disiplinDetail.helm.skor}% | Tepat: {item.disiplinDetail.terlambat.skor}%
                            </span>
                          ) : (
                            <span>{item.catatan || '-'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setEditNilai(item.nilai);
                              setEditCatatan(item.catatan || '');
                              setEditAlasan('');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Perbaiki</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">
                Belum ada entri penilaian disiplin yang Anda simpan.
              </p>
            )}
          </section>
        )}

          {/* WEEKLY STUDENT RECAP MODAL (SENIN S.D. SABTU) FOR FREQUENT OFFENDER IDENTIFICATION */}
          {activeWeeklyModalIndicator && (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-5xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rekapitulasi 1 Minggu (Senin s.d. Sabtu)</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Rekap Siswa Kelas {kelasList.find((k) => k.id === kelasId)?.nama}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluasi frekuensi masalah / pelanggaran siswa selama 6 hari kerja sekolah.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveWeeklyModalIndicator(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-auto"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Indicator Switcher Tabs inside Modal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {(
                      [
                        { id: 'usageReport', label: '1. Usage Report' },
                        { id: 'kehadiran', label: '2. Kehadiran' },
                        { id: 'helm', label: '3. Pakai Helm' },
                        { id: 'terlambat', label: '4. Ketepatan Waktu' },
                      ] as const
                    ).map((ind) => (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() => setActiveWeeklyModalIndicator(ind.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                          activeWeeklyModalIndicator === ind.id
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {ind.label}
                      </button>
                    ))}
                  </div>

                  {/* Student Search */}
                  <div className="relative shrink-0">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Cari siswa..."
                      value={weeklyModalSearch}
                      onChange={(e) => setWeeklyModalSearch(e.target.value)}
                      className="pl-8 pr-3 py-1 border border-slate-300 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* 6-Day Student Matrix Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 text-xs uppercase font-bold border-b border-slate-300">
                        <th className="py-3 px-3 text-center w-10">NO</th>
                        <th className="py-3 px-3 min-w-[160px]">NAMA SISWA</th>
                        {periodDays.map((d) => (
                          <th key={d.dayName} className="py-3 px-2 text-center font-bold">
                            <span className="block">{d.dayName}</span>
                            <span className="text-[10px] text-slate-500 font-normal block font-mono">
                              {d.dateIso.slice(8, 10)} Oct
                            </span>
                          </th>
                        ))}
                        <th className="py-3 px-3 text-center min-w-[120px]">TOTAL CATATAN / PELANGGARAN</th>
                        <th className="py-3 px-3 text-center min-w-[140px]">STATUS EVALUASI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentClassStudents
                        .filter((s) => s.nama.toLowerCase().includes(weeklyModalSearch.toLowerCase()))
                        .map((siswa, sIdx) => {
                          let violationCount = 0;

                          // Compute status for each day (Senin - Sabtu)
                          const dayCells = periodDays.map((d) => {
                            // Find evaluation entry for this date & class
                            const evalForDay = teacherEvaluations.find(
                              (ev) => ev.tanggal === d.dateIso && ev.kelasId === kelasId
                            );

                            const studentRec = evalForDay?.disiplinDetail?.siswaDetail?.find(
                              (sr) => sr.siswaId === siswa.id || sr.nama === siswa.nama
                            );

                            if (activeWeeklyModalIndicator === 'usageReport') {
                              const isMengisi = studentRec ? studentRec.isiUsageReport : true;
                              if (!isMengisi) violationCount++;
                              return {
                                label: isMengisi ? '✓' : '❌',
                                bad: !isMengisi,
                                detail: isMengisi ? 'Mengisi' : 'Tidak Mengisi',
                              };
                            } else if (activeWeeklyModalIndicator === 'kehadiran') {
                              const st = studentRec ? studentRec.statusKehadiran : 'Hadir';
                              if (st !== 'Hadir') violationCount++;
                              return {
                                label: st === 'Hadir' ? 'H' : st === 'Izin' ? 'I' : st === 'Sakit' ? 'S' : 'A',
                                bad: st === 'Alpa',
                                warning: st === 'Izin' || st === 'Sakit',
                                detail: st,
                              };
                            } else if (activeWeeklyModalIndicator === 'helm') {
                              const isHelm = studentRec ? studentRec.pakaiHelm : true;
                              if (!isHelm) violationCount++;
                              return {
                                label: isHelm ? '✓' : '❌',
                                bad: !isHelm,
                                detail: isHelm ? 'Pakai Helm' : 'Tidak Helm',
                              };
                            } else {
                              // terlambat
                              const isTepat = studentRec ? studentRec.tepatWaktu : true;
                              if (!isTepat) violationCount++;
                              return {
                                label: isTepat ? '✓' : '❌',
                                bad: !isTepat,
                                detail: isTepat ? 'Tepat Waktu' : 'Terlambat',
                              };
                            }
                          });

                          const hasHighViolation = violationCount >= 2;

                          return (
                            <tr
                              key={siswa.id}
                              className={`hover:bg-slate-50 transition-colors ${
                                hasHighViolation ? 'bg-rose-50/40 font-medium' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center text-slate-500 text-xs font-mono">
                                {sIdx + 1}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900 text-xs block">{siswa.nama}</span>
                                <span className="text-[10px] text-slate-500 font-mono block">{siswa.nisn}</span>
                              </td>

                              {/* 6 Day Columns */}
                              {dayCells.map((c, dIdx) => (
                                <td key={dIdx} className="py-2.5 px-2 text-center text-xs">
                                  <span
                                    title={c.detail}
                                    className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                      c.bad
                                        ? 'bg-rose-600 text-white shadow-2xs'
                                        : c.warning
                                        ? 'bg-amber-500 text-white shadow-2xs'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {c.label}
                                  </span>
                                </td>
                              ))}

                              {/* Violation Count */}
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums ${
                                    violationCount > 0
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {violationCount} Kali
                                </span>
                              </td>

                              {/* Action Status */}
                              <td className="py-2.5 px-3 text-center text-xs">
                                {violationCount >= 2 ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                    Perlu Perhatian
                                  </span>
                                ) : violationCount === 1 ? (
                                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    Catatan Ringan
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    Sangat Baik
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs text-slate-500">
                  <p>
                    <strong>Petunjuk:</strong> Siswa dengan total catatan &gt; 1 kali disorot otomatis dengan warna latar merah agar memudahkan wali kelas / juri mengidentifikasi pelanggaran berulang.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveWeeklyModalIndicator(null)}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
                  >
                    Tutup Rekap Mingguan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editingItem && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-base font-bold text-slate-900">Perbaiki Penilaian Disiplin</h3>
                  <span className="text-xs font-bold text-slate-500">Kelas {editingItem.kelasNama}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nilai Akhir Disiplin Baru</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={editNilai}
                      onChange={(e) => setEditNilai(Number(e.target.value))}
                      className="w-full border p-2 rounded-lg font-bold text-blue-700 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                    <textarea
                      rows={2}
                      value={editCatatan}
                      onChange={(e) => setEditCatatan(e.target.value)}
                      className="w-full border p-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-rose-700 mb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Alasan Perbaikan (Wajib Audit Log)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alasan perubahan nilai..."
                      value={editAlasan}
                      onChange={(e) => setEditAlasan(e.target.value)}
                      className="w-full border border-rose-300 p-2 rounded-lg bg-rose-50/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-3 py-1.5 text-slate-600 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
};
