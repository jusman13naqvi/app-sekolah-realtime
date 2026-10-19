import React, { useState } from 'react';
import { User, Kelas, Siswa, Periode, Penilaian, LogAktivitas, Pengaturan } from '../types';
import { DatabaseSyncView } from './DatabaseSyncView';
import {
  Users,
  School,
  Calendar,
  FileSpreadsheet,
  Settings,
  Shield,
  Plus,
  ToggleLeft,
  ToggleRight,
  Download,
  Trash2,
  FileUp,
  Search,
  UserPlus,
  AlertCircle,
  KeyRound,
  Image,
  Upload,
  RotateCcw,
  Database,
  Edit2,
} from 'lucide-react';

interface AdminPortalProps {
  users: User[];
  kelasList: Kelas[];
  siswaList: Siswa[];
  periodeList: Periode[];
  allEvaluations: Penilaian[];
  logs: LogAktivitas[];
  settings: Pengaturan;
  onAddUser: (u: Omit<User, 'id' | 'dibuatPada'>, pass: string) => void;
  onResetPassword: (userId: string, newPass: string) => void;
  onToggleUserStatus: (id: string) => void;
  onAddKelas: (k: Omit<Kelas, 'id'>) => void;
  onUpdateKelas: (id: string, k: Partial<Omit<Kelas, 'id'>>) => void;
  onDeleteKelas: (id: string) => void;
  onDeleteAllKelas: () => void;
  onSeedSampleKelas: () => void;
  onAddSiswa: (s: Omit<Siswa, 'id'>) => void;
  onDeleteSiswa: (siswaId: string) => void;
  onDeleteAllSiswa: () => void;
  onImportSiswaCSV: (csv: string) => Promise<{ importedCount: number; errors: string[] }>;
  onCreatePeriode: (p: Omit<Periode, 'id' | 'status'>) => void;
  onSetActivePeriode: (id: string) => void;
  onUpdatePeriode: (id: string, p: Partial<Omit<Periode, 'id'>>) => void;
  onDeletePeriode: (id: string) => void;
  onDeleteEvaluation: (id: string, alasan: string) => void;
  onUpdateSettings: (s: Partial<Pengaturan>) => void;
  onExportCSV: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  users,
  kelasList,
  siswaList,
  periodeList,
  allEvaluations,
  logs,
  settings,
  onAddUser,
  onResetPassword,
  onToggleUserStatus,
  onAddKelas,
  onUpdateKelas,
  onDeleteKelas,
  onDeleteAllKelas,
  onSeedSampleKelas,
  onAddSiswa,
  onDeleteSiswa,
  onDeleteAllSiswa,
  onImportSiswaCSV,
  onCreatePeriode,
  onSetActivePeriode,
  onUpdatePeriode,
  onDeletePeriode,
  onDeleteEvaluation,
  onUpdateSettings,
  onExportCSV,
}) => {
  const [activeTab, setActiveTab] = useState<
    'users' | 'kelas' | 'siswa' | 'periode' | 'evaluations' | 'logs' | 'settings' | 'apps-script'
  >('users');

  // User Form
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newNip, setNewNip] = useState('');
  const [newRole, setNewRole] = useState<'guru' | 'admin'>('guru');
  const [newPass, setNewPass] = useState('guru123');

  // Reset Password State
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [resetNewPass, setResetNewPass] = useState('');

  // Kelas Form
  const [showAddKelasModal, setShowAddKelasModal] = useState(false);
  const [newKelasNama, setNewKelasNama] = useState('');
  const [newTingkat, setNewTingkat] = useState<number>(7);
  const [newWaliKelas, setNewWaliKelas] = useState('');

  // Edit Kelas State
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [editKelasNama, setEditKelasNama] = useState('');
  const [editKelasTingkat, setEditKelasTingkat] = useState<number>(7);
  const [editKelasWali, setEditKelasWali] = useState('');
  const [editKelasStatus, setEditKelasStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  // Periode Form & Edit
  const [showAddPeriodeModal, setShowAddPeriodeModal] = useState(false);
  const [newPeriodeNama, setNewPeriodeNama] = useState('');
  const [newTanggalMulai, setNewTanggalMulai] = useState('');
  const [newTanggalSelesai, setNewTanggalSelesai] = useState('');

  const [editingPeriode, setEditingPeriode] = useState<Periode | null>(null);
  const [editPeriodeNama, setEditPeriodeNama] = useState('');
  const [editPeriodeMulai, setEditPeriodeMulai] = useState('');
  const [editPeriodeSelesai, setEditPeriodeSelesai] = useState('');
  const [editPeriodeStatus, setEditPeriodeStatus] = useState<'aktif' | 'arsip'>('aktif');

  const handleSaveEditPeriode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriode) return;
    try {
      onUpdatePeriode(editingPeriode.id, {
        nama: editPeriodeNama.trim(),
        tanggalMulai: editPeriodeMulai,
        tanggalSelesai: editPeriodeSelesai,
        status: editPeriodeStatus,
      });
      setEditingPeriode(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal merubah data periode');
    }
  };

  // Siswa Form
  const [showAddSiswaModal, setShowAddSiswaModal] = useState(false);
  const [showImportSiswaModal, setShowImportSiswaModal] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [newSiswaNama, setNewSiswaNama] = useState('');
  const [newSiswaNisn, setNewSiswaNisn] = useState('');
  const [newSiswaKelasId, setNewSiswaKelasId] = useState<string>(kelasList[0]?.id || '7a');
  const [csvText, setCsvText] = useState('');

  // Evaluation Delete Modal
  const [deletingItem, setDeletingItem] = useState<Penilaian | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Settings Form & Logo Upload
  const [settingsForm, setSettingsForm] = useState<Pengaturan>(settings);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onAddUser({ username: newUsername.trim(), nama: newNama.trim(), nip: newNip.trim(), role: newRole, status: 'aktif' }, newPass);
      setShowAddUserModal(false);
      setNewUsername(''); setNewNama(''); setNewNip('');
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal'); }
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !resetNewPass.trim()) return;
    try {
      onResetPassword(resetTargetUser.id, resetNewPass.trim());
      alert(`Berhasil mereset password untuk ${resetTargetUser.nama} (${resetTargetUser.username})!`);
      setResetTargetUser(null);
      setResetNewPass('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mereset password');
    }
  };

  const handleCreateKelas = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onAddKelas({ nama: newKelasNama.trim().toUpperCase(), tingkat: Number(newTingkat), waliKelas: newWaliKelas.trim(), status: 'aktif' });
      setShowAddKelasModal(false);
      setNewKelasNama(''); setNewWaliKelas('');
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal'); }
  };

  const handleSaveEditKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKelas || !editKelasNama.trim()) return;
    try {
      onUpdateKelas(editingKelas.id, {
        nama: editKelasNama.trim().toUpperCase(),
        tingkat: Number(editKelasTingkat),
        waliKelas: editKelasWali.trim(),
        status: editKelasStatus,
      });
      setEditingKelas(null);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal mengubah data kelas'); }
  };

  const handleCreateSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    const kObj = kelasList.find((k) => k.id === newSiswaKelasId);
    if (!kObj) return;
    try {
      onAddSiswa({
        nama: newSiswaNama.trim(),
        nisn: newSiswaNisn.trim() || `008${Math.floor(10000000 + Math.random() * 90000000)}`,
        kelasId: kObj.id,
        kelasNama: kObj.nama,
      });
      setShowAddSiswaModal(false);
      setNewSiswaNama(''); setNewSiswaNisn('');
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal'); }
  };

  const handleImportCSV = async () => {
    if (!csvText.trim()) {
      alert('Masukkan teks CSV data siswa terlebih dahulu!');
      return;
    }
    const res = await onImportSiswaCSV(csvText);
    alert(`Berhasil mengimpor ${res.importedCount} data siswa!`);
    setShowImportSiswaModal(false);
    setCsvText('');
  };

  const handleDownloadStudentTemplate = () => {
    const template = 'No,Nama,Kelas,NISN\n1,Aditya Pratama,7A,0081234567\n2,Budi Raharjo,7A,0087654321\n3,Citra Dewi,7B,0089988776\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Template_Data_Siswa_SMPN7.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreatePeriode = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onCreatePeriode({ nama: newPeriodeNama.trim(), tanggalMulai: newTanggalMulai, tanggalSelesai: newTanggalSelesai });
      setShowAddPeriodeModal(false);
      setNewPeriodeNama('');
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal'); }
  };

  const ConfirmDeleteEvaluation = () => {
    if (!deletingItem || !deleteReason.trim()) {
      alert('Wajib mengisi alasan pembatalan!'); return;
    }
    onDeleteEvaluation(deletingItem.id, deleteReason);
    setDeletingItem(null); setDeleteReason('');
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setSettingsForm((prev) => ({ ...prev, logoUrl: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    alert('Pengaturan sekolah & logo berhasil diperbarui!');
  };

  const filteredSiswa = siswaList.filter(
    (s) =>
      (selectedClassFilter === 'all' || s.kelasId === selectedClassFilter) &&
      (s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-12">
      {/* SIDEBAR ADMIN NAVIGATION */}
      <aside className="w-full lg:w-64 shrink-0 space-y-4">
        {/* Admin Card */}
        <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-800/40 shadow-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-base border border-blue-400/30">
              <Shield className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">Panel Administrator</h2>
              <span className="text-[10px] text-emerald-300 font-extrabold bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-full inline-block mt-0.5">
                Full Privileges
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-300 pt-3 border-t border-indigo-800/60 space-y-1.5">
            <p className="text-[11px] text-blue-200/80 font-medium">{settings.namaSekolah}</p>
            <button
              onClick={onExportCSV}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 mt-2 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 space-y-1">
          <p className="text-[10px] uppercase font-extrabold text-slate-400 px-3 py-1.5 tracking-wider">
            Pengelolaan Data
          </p>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'users' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-white' : 'text-blue-600'}`} />
              <span>Kelola Akun Juri</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('siswa')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'siswa' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserPlus className={`w-4 h-4 ${activeTab === 'siswa' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Kelola Data Siswa</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'siswa' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {siswaList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('kelas')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'kelas' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <School className={`w-4 h-4 ${activeTab === 'kelas' ? 'text-white' : 'text-amber-600'}`} />
              <span>Kelola Kelas</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'kelas' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {kelasList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('periode')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'periode' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className={`w-4 h-4 ${activeTab === 'periode' ? 'text-white' : 'text-purple-600'}`} />
              <span>Periode Penilaian</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'periode' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {periodeList.length}
            </span>
          </button>

          <p className="text-[10px] uppercase font-extrabold text-slate-400 px-3 pt-3 pb-1 tracking-wider">
            Sistem & Laporan
          </p>

          <button
            onClick={() => setActiveTab('evaluations')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'evaluations' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'evaluations' ? 'text-white' : 'text-indigo-600'}`} />
              <span>Semua Penilaian</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'evaluations' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {allEvaluations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'logs' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Shield className={`w-4 h-4 ${activeTab === 'logs' ? 'text-white' : 'text-rose-600'}`} />
              <span>Audit Log</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'logs' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {logs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'settings' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-slate-500'}`} />
              <span>Pengaturan & Logo</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('apps-script')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
              activeTab === 'apps-script'
                ? 'bg-emerald-600 text-white shadow-md font-extrabold'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Status DB Sync</span>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded">
              Live
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold border border-amber-400/30 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Panel Administrator Utama</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Pengelolaan Akun Juri, Data Siswa & Pengaturan Logo
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              SMP Negeri 7 Muara Badak — Buat Akun Juri, Reset Password, Kelola Siswa & Ganti Logo Sekolah.
            </p>
          </div>
        </div>

      {/* TAB 1: USERS & RESET PASSWORD */}
      {activeTab === 'users' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manajemen Akun Juri & Administrator</h2>
              <p className="text-xs text-slate-500">Buat akun juri penilai baru dan reset kata sandi sesuai kebutuhan.</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Juri Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Nama Lengkap Juri/Guru</th>
                  <th className="py-3 px-4">NIP</th>
                  <th className="py-3 px-4">Hak Akses</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi / Reset Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.username}</td>
                    <td className="py-3 px-4 text-slate-800">{u.nama}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{u.nip || '-'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          u.status === 'aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setResetTargetUser(u);
                            setResetNewPass('');
                          }}
                          className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>Reset Password</span>
                        </button>

                        <button
                          onClick={() => onToggleUserStatus(u.id)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                        >
                          {u.status === 'aktif' ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: SISWA MANAGEMENT */}
      {activeTab === 'siswa' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manajemen Data Siswa per Kelas</h2>
              <p className="text-xs text-slate-500">
                Data siswa ini digunakan langsung oleh Juri/Guru saat melakukan penilaian Kelas Disiplin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadStudentTemplate}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template CSV</span>
              </button>

              <button
                onClick={() => setShowImportSiswaModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Import CSV Sekaligus</span>
              </button>

              <button
                onClick={() => setShowAddSiswaModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Siswa</span>
              </button>

              {siswaList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Apakah Anda yakin ingin MENGHAPUS SELURUH DATA SISWA? Tindakan ini tidak dapat dibatalkan!')) {
                      onDeleteAllSiswa();
                      alert('Seluruh data siswa berhasil dihapus.');
                    }
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus Semua Siswa ({siswaList.length})</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Filter Kelas:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1 bg-white font-semibold text-slate-900"
              >
                <option value="all">Semua Kelas ({siswaList.length} Siswa)</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kelas {k.nama} ({siswaList.filter((s) => s.kelasId === k.id).length} Siswa)
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Cari nama / NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 border border-slate-300 rounded-lg text-xs w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {filteredSiswa.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                    <th className="py-3 px-4 text-center w-12">No</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4 font-mono">NISN</th>
                    <th className="py-3 px-4 text-center w-24">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSiswa.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-center text-slate-500 text-xs font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.nama}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold text-xs">
                          Kelas {s.kelasNama}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">{s.nisn}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus data siswa "${s.nama}"?`)) {
                              onDeleteSiswa(s.id);
                            }
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Siswa Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
              <UserPlus className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Belum Ada Data Siswa</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan klik tombol <strong>"Tambah Siswa"</strong> atau <strong>"Import CSV Sekaligus"</strong> di atas untuk memasukkan data siswa kelas Anda.
              </p>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: KELAS */}
      {activeTab === 'kelas' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manajemen Daftar Kelas</h2>
              <p className="text-xs text-slate-500">
                Tambah, ubah nama/wali kelas, atau hapus kelas yang berpartisipasi dalam penilaian.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Isi ulang contoh daftar kelas standar sekolah (7A s.d. 9B)?')) {
                    onSeedSampleKelas();
                  }
                }}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset Contoh Kelas (7A-9B)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddKelasModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kelas Baru</span>
              </button>

              {kelasList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Apakah Anda yakin ingin MENGHAPUS SELURUH DAFTAR KELAS? Tindakan ini tidak dapat dibatalkan!')) {
                      onDeleteAllKelas();
                    }
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus Semua Kelas ({kelasList.length})</span>
                </button>
              )}
            </div>
          </div>

          {kelasList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {kelasList.map((k) => (
                <div key={k.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 relative group hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-lg">Kelas {k.nama}</span>
                    <span className="text-xs bg-white border font-semibold px-2 py-0.5 rounded text-slate-700 shadow-2xs">
                      Tingkat {k.tingkat}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Wali Kelas:</strong> {k.waliKelas || '-'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className="text-blue-700 font-bold">
                      {siswaList.filter((s) => s.kelasId === k.id).length} Siswa
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingKelas(k);
                          setEditKelasNama(k.nama);
                          setEditKelasTingkat(k.tingkat);
                          setEditKelasWali(k.waliKelas || '');
                          setEditKelasStatus(k.status || 'aktif');
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit Data Kelas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus "Kelas ${k.nama}"?`)) {
                            onDeleteKelas(k.id);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Hapus Kelas Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
              <School className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Belum Ada Data Kelas</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan klik tombol <strong>"Tambah Kelas Baru"</strong> atau <strong>"Reset Contoh Kelas"</strong> di atas untuk membuat kelas sekolah Anda.
              </p>
            </div>
          )}
        </section>
      )}

      {/* TAB 4: PERIODE */}
      {activeTab === 'periode' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manajemen Periode Mingguan</h2>
              <p className="text-xs text-slate-500">Atur rentang tanggal minggu aktif dan lihat arsip penilaian.</p>
            </div>
            <button
              onClick={() => setShowAddPeriodeModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Periode Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {periodeList.map((p) => {
              const isActive = p.status === 'aktif';
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isActive ? 'bg-blue-50/70 border-blue-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{p.nama}</span>
                      {isActive && (
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full uppercase">
                          Periode Aktif Saat Ini
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      Rentang Tanggal: {p.tanggalMulai} s.d. {p.tanggalSelesai}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => onSetActivePeriode(p.id)}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold shadow-2xs"
                      >
                        Aktifkan Minggu Ini
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setEditingPeriode(p);
                        setEditPeriodeNama(p.nama);
                        setEditPeriodeMulai(p.tanggalMulai);
                        setEditPeriodeSelesai(p.tanggalSelesai);
                        setEditPeriodeStatus(p.status);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 bg-white"
                      title="Edit Judul & Tanggal Periode"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus "Periode ${p.nama}"? Tindakan ini tidak dapat dibatalkan.`)) {
                          onDeletePeriode(p.id);
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 bg-white"
                      title="Hapus Periode Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 5: EVALUATIONS */}
      {activeTab === 'evaluations' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Seluruh Data Penilaian Masuk</h2>
              <p className="text-xs text-slate-500">Administrator dapat membatalkan entri penilaian dengan alasan resmi.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Nilai Total</th>
                  <th className="py-3 px-4">Juri Penilai</th>
                  <th className="py-3 px-4 text-center">Aksi Batal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allEvaluations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-xs text-slate-600 font-mono">{item.tanggal}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">Kelas {item.kelasNama}</td>
                    <td className="py-3 px-4 text-xs text-slate-700">{item.kategoriNama}</td>
                    <td className="py-3 px-4 text-center font-black text-blue-700 tabular-nums">{item.nilai}</td>
                    <td className="py-3 px-4 text-xs text-slate-800">{item.guruNama}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 6: LOGS */}
      {activeTab === 'logs' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-lg font-bold text-slate-900">Catatan Audit Aktivitas Sistem</h2>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span className="font-bold text-slate-800">{log.nama} ({log.username})</span>
                  <span>{new Date(log.waktu).toLocaleString('id-ID')}</span>
                </div>
                <p><strong>{log.aksi}:</strong> {log.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 7: SETTINGS & LOGO UPLOAD */}
      {activeTab === 'settings' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-lg font-bold text-slate-900">Pengaturan Identitas & Logo Sekolah</h2>
            <p className="text-xs text-slate-500">Ubah nama sekolah, alamat, dan unggah logo sekolah resmi.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
            {/* SCHOOL LOGO CUSTOMIZATION */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-600" />
                <span>Logo Resmi Sekolah</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-2xl border border-slate-300 p-2 flex items-center justify-center shrink-0 shadow-inner">
                  {settingsForm.logoUrl ? (
                    <img src={settingsForm.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold text-center">Logo Default</span>
                  )}
                </div>

                <div className="space-y-2 text-xs w-full">
                  <div className="flex items-center gap-2">
                    <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl cursor-pointer shadow-sm transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Gambar Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                    </label>

                    {settingsForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '' })}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Default
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Format: PNG, JPG, atau SVG (Maks. 2MB). Logo ini akan ditampilkan di header & beranda.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Sekolah</label>
              <input
                type="text"
                required
                value={settingsForm.namaSekolah}
                onChange={(e) => setSettingsForm({ ...settingsForm, namaSekolah: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Dashboard</label>
              <input
                type="text"
                required
                value={settingsForm.judulDashboard}
                onChange={(e) => setSettingsForm({ ...settingsForm, judulDashboard: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subjudul Dashboard</label>
              <textarea
                rows={2}
                value={settingsForm.subjudulDashboard}
                onChange={(e) => setSettingsForm({ ...settingsForm, subjudulDashboard: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Sekolah</label>
              <input
                type="text"
                value={settingsForm.alamatSekolah}
                onChange={(e) => setSettingsForm({ ...settingsForm, alamatSekolah: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5"
              />
            </div>

            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-colors">
              Simpan Pengaturan & Logo
            </button>
          </form>
        </section>
      )}

      {/* TAB 8: DATABASE ONLINE REALTIME SYNC STATUS */}
      {activeTab === 'apps-script' && (
        <section className="space-y-4">
          <DatabaseSyncView
            usersCount={users.length}
            kelasListCount={kelasList.length}
            siswaListCount={siswaList.length}
            penilaianListCount={allEvaluations.length}
            lastUpdated={new Date().toLocaleTimeString('id-ID')}
          />
        </section>
      )}
      </main>

      {/* MODAL: RESET PASSWORD */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <span>Reset Password Akun</span>
            </h3>
            <p className="text-xs text-slate-600">
              Ubah kata sandi baru untuk <strong>{resetTargetUser.nama}</strong> (Username: <code>{resetTargetUser.username}</code>).
            </p>
            <form onSubmit={handleConfirmResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan password baru..."
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-3 py-1.5 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm">
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SISWA */}
      {showAddSiswaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Tambah Data Siswa Baru</h3>
            <form onSubmit={handleCreateSiswa} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Siswa</label>
                <input
                  type="text"
                  required
                  value={newSiswaNama}
                  onChange={(e) => setNewSiswaNama(e.target.value)}
                  placeholder="Misal: Ahmad Zaky"
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kelas</label>
                <select
                  value={newSiswaKelasId}
                  onChange={(e) => setNewSiswaKelasId(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm font-bold"
                >
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      Kelas {k.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                <input
                  type="text"
                  value={newSiswaNisn}
                  onChange={(e) => setNewSiswaNisn(e.target.value)}
                  placeholder="0081234567..."
                  className="w-full border p-2 rounded-lg text-sm font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddSiswaModal(false)} className="px-3 py-1.5 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg">
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT SISWA CSV */}
      {showImportSiswaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <FileUp className="w-5 h-5 text-emerald-600" />
              <span>Import Data Siswa Sekaligus (Upload File CSV)</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Upload file CSV template yang telah Anda unduh dan isi, atau tempelkan (*paste*) teks isi file CSV:
              <br />
              <code className="bg-slate-100 px-2.5 py-1 rounded font-mono text-[11px] inline-block mt-1 font-bold text-slate-800">
                No,Nama,Kelas,NISN
              </code>
            </p>

            {/* Direct File Selector / Drag & Drop */}
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-xl p-4 text-center transition-all group">
              <input
                type="file"
                accept=".csv,.txt"
                id="csvFileInput"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (content) {
                        setCsvText(content);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="csvFileInput"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5 text-slate-600 group-hover:text-emerald-700"
              >
                <Upload className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                  Pilih / Upload File CSV (.csv) dari Perangkat Anda
                </span>
                <span className="text-[11px] text-slate-500">
                  Sistem akan otomatis membaca seluruh baris data siswa dari file tersebut.
                </span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Atau Pratinjau / Edit Teks CSV:
              </label>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="No,Nama,Kelas,NISN&#10;1,Aditya Pratama,7A,0081234567&#10;2,Budi Raharjo,7A,0087654321"
                className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowImportSiswaModal(false);
                  setCsvText('');
                }}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleImportCSV}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Proses Import Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Tambah Akun Juri / Guru</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Misal: juri1"
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Juri</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Misal: Budi Santoso, S.Pd."
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hak Akses</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'guru' | 'admin')}
                  className="w-full border p-2 rounded-lg text-sm font-semibold"
                >
                  <option value="guru">Juri / Guru Penilai</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password Awal</label>
                <input
                  type="text"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="px-3 py-1.5 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg">
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD KELAS */}
      {showAddKelasModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Tambah Kelas Baru</h3>
            <form onSubmit={handleCreateKelas} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kelas (misal: 7C)</label>
                <input
                  type="text"
                  required
                  value={newKelasNama}
                  onChange={(e) => setNewKelasNama(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm uppercase font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat</label>
                <select
                  value={newTingkat}
                  onChange={(e) => setNewTingkat(Number(e.target.value))}
                  className="w-full border p-2 rounded-lg text-sm font-bold"
                >
                  <option value={7}>Kelas 7</option>
                  <option value={8}>Kelas 8</option>
                  <option value={9}>Kelas 9</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wali Kelas</label>
                <input
                  type="text"
                  value={newWaliKelas}
                  onChange={(e) => setNewWaliKelas(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddKelasModal(false)} className="px-3 py-1.5 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg">
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT KELAS */}
      {editingKelas && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              <span>Ubah Data Kelas</span>
            </h3>

            <form onSubmit={handleSaveEditKelas} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  value={editKelasNama}
                  onChange={(e) => setEditKelasNama(e.target.value)}
                  placeholder="Misal: 7A, 8B..."
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat</label>
                <select
                  value={editKelasTingkat}
                  onChange={(e) => setEditKelasTingkat(Number(e.target.value))}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm font-bold"
                >
                  <option value={7}>Kelas 7</option>
                  <option value={8}>Kelas 8</option>
                  <option value={9}>Kelas 9</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wali Kelas</label>
                <input
                  type="text"
                  value={editKelasWali}
                  onChange={(e) => setEditKelasWali(e.target.value)}
                  placeholder="Nama Wali Kelas..."
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Kelas</label>
                <select
                  value={editKelasStatus}
                  onChange={(e) => setEditKelasStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm font-bold"
                >
                  <option value="aktif">Aktif (Ikut Penilaian)</option>
                  <option value="nonaktif">Nonaktif / Arsip</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingKelas(null)}
                  className="px-3 py-1.5 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PERIODE */}
      {showAddPeriodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Buat Periode Baru</h3>
            <form onSubmit={handleCreatePeriode} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Periode</label>
                <input
                  type="text"
                  required
                  placeholder="Minggu Ke-4 Oktober 2026"
                  value={newPeriodeNama}
                  onChange={(e) => setNewPeriodeNama(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  required
                  value={newTanggalMulai}
                  onChange={(e) => setNewTanggalMulai(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  required
                  value={newTanggalSelesai}
                  onChange={(e) => setNewTanggalSelesai(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddPeriodeModal(false)} className="px-3 py-1.5 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg">
                  Buat Periode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE EVALUATION REASON */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-rose-700 border-b pb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Pembatalan Penilaian</span>
            </h3>
            <p className="text-xs text-slate-600">
              Anda akan menghapus penilaian Kelas {deletingItem.kelasNama} tanggal {deletingItem.tanggal}.
            </p>
            <input
              type="text"
              required
              placeholder="Alasan pembatalan..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full border border-rose-300 p-2 rounded-lg text-xs"
            />
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setDeletingItem(null)} className="px-3 py-1.5 text-slate-600 text-xs">
                Batal
              </button>
              <button type="button" onClick={ConfirmDeleteEvaluation} className="px-4 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg">
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PERIODE */}
      {editingPeriode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Edit Periode Penilaian</h3>
            <form onSubmit={handleSaveEditPeriode} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama / Judul Periode</label>
                <input
                  type="text"
                  required
                  value={editPeriodeNama}
                  onChange={(e) => setEditPeriodeNama(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai (Senin)</label>
                <input
                  type="date"
                  required
                  value={editPeriodeMulai}
                  onChange={(e) => setEditPeriodeMulai(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai (Sabtu)</label>
                <input
                  type="date"
                  required
                  value={editPeriodeSelesai}
                  onChange={(e) => setEditPeriodeSelesai(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Periode</label>
                <select
                  value={editPeriodeStatus}
                  onChange={(e) => setEditPeriodeStatus(e.target.value as 'aktif' | 'arsip')}
                  className="w-full border p-2.5 rounded-xl text-sm font-bold"
                >
                  <option value="aktif">Aktif (Minggu Ini)</option>
                  <option value="arsip">Arsip (Non-Aktif)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingPeriode(null)}
                  className="px-3.5 py-2 text-slate-600 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
