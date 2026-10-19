import { useState, useEffect } from 'react';
import { User, PenilaianDisiplinDetail, Siswa } from './types';
import { dataStore } from './services/dataStore';
import { Header } from './components/Header';
import { PublicDashboard } from './components/PublicDashboard';
import { CategoryDetail } from './components/CategoryDetail';
import { LoginPage } from './components/LoginPage';
import { TeacherPortal } from './components/TeacherPortal';
import { AdminPortal } from './components/AdminPortal';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'detail' | 'login' | 'guru' | 'admin'>('dashboard');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('disiplin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // Realtime Firestore Subscription & Session Restore
  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      triggerRefresh();
    });

    const savedSession = localStorage.getItem('smpn7_session_user_v2');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        console.error('Failed to parse saved session:', e);
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Data Queries
  const overview = dataStore.getDashboardOverview();
  const activePeriode = dataStore.getActivePeriode();
  const kategoriList = dataStore.getKategoriList();
  const kelasList = dataStore.getKelasList(true);
  const siswaList = dataStore.getAllSiswa();
  const users = dataStore.getUsers();
  const periodeList = dataStore.getPeriodeList();
  const allEvaluations = dataStore.getPenilaianList();
  const logs = dataStore.getLogs();
  const settings = dataStore.getSettings();

  const selectedCategorySummary = dataStore.getRekapKategori(selectedCategoryId, activePeriode.id);

  // Teacher evaluations
  const teacherEvaluations = currentUser
    ? allEvaluations.filter((p) => p.guruUsername === currentUser.username)
    : [];

  // Handlers
  const handleSelectCategory = (kategoriId: string) => {
    setSelectedCategoryId(kategoriId);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async (username: string, pass: string) => {
    setLoginError(null);
    try {
      const result = await dataStore.validateCredentials(username, pass);
      if (result) {
        setCurrentUser(result.user);
        localStorage.setItem('smpn7_session_user_v2', JSON.stringify(result.user));

        if (result.user.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('guru');
        }
      } else {
        setLoginError('Username atau kata sandi tidak cocok. Silakan periksa kembali.');
      }
    } catch (e) {
      setLoginError('Gagal menghubungkan ke server login. Silakan coba beberapa saat lagi.');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      dataStore.addLog(currentUser.username, currentUser.nama, 'LOGOUT', 'Pengguna keluar dari sistem.');
    }
    setCurrentUser(null);
    localStorage.removeItem('smpn7_session_user_v2');
    setCurrentView('dashboard');
  };

  const handleSubmitPenilaianDisiplin = async (data: {
    tanggal: string;
    kelasId: string;
    disiplinDetail: PenilaianDisiplinDetail;
    catatan?: string;
  }) => {
    if (!currentUser) throw new Error('Sesi pengguna tidak aktif');
    const record = await dataStore.addPenilaianDisiplin(data, currentUser);
    triggerRefresh();
    return { success: true, message: `Penilaian Disiplin Kelas ${record.kelasNama} berhasil disimpan!` };
  };

  const handleUpdatePenilaian = async (
    id: string,
    nilaiBaru: number,
    catatanBaru: string,
    alasan: string
  ) => {
    if (!currentUser) throw new Error('Sesi pengguna tidak aktif');
    await dataStore.updatePenilaian(id, nilaiBaru, catatanBaru, alasan, currentUser);
    triggerRefresh();
    return { success: true, message: 'Data penilaian berhasil diperbarui' };
  };

  const handleDeleteEvaluation = async (id: string, alasan: string) => {
    if (!currentUser) return;
    await dataStore.deletePenilaian(id, alasan, currentUser);
    triggerRefresh();
  };

  const handleAddUser = async (userData: Omit<User, 'id' | 'dibuatPada'>, pass: string) => {
    await dataStore.addUser(userData, pass);
    triggerRefresh();
  };

  const handleResetPassword = async (userId: string, newPass: string) => {
    await dataStore.resetUserPassword(userId, newPass);
    triggerRefresh();
  };

  const handleToggleUserStatus = async (id: string) => {
    await dataStore.toggleUserStatus(id);
    triggerRefresh();
  };

  const handleAddKelas = async (kelasData: Omit<import('./types').Kelas, 'id'>) => {
    await dataStore.addKelas(kelasData);
    triggerRefresh();
  };

  const handleAddSiswa = async (siswaData: Omit<Siswa, 'id'>) => {
    await dataStore.addSiswa(siswaData);
    triggerRefresh();
  };

  const handleImportSiswaCSV = async (csvContent: string) => {
    const res = await dataStore.importSiswaCSV(csvContent);
    triggerRefresh();
    return res;
  };

  const handleCreatePeriode = async (periodeData: Omit<import('./types').Periode, 'id' | 'status'>) => {
    await dataStore.addPeriode(periodeData, true);
    triggerRefresh();
  };

  const handleSetActivePeriode = async (id: string) => {
    await dataStore.setActivePeriode(id);
    triggerRefresh();
  };

  const handleUpdateSettings = async (newSettings: Partial<import('./types').Pengaturan>) => {
    await dataStore.updateSettings(newSettings);
    triggerRefresh();
  };

  const handleExportCSV = () => {
    const records = dataStore.getPenilaianList();
    if (records.length === 0) {
      alert('Belum ada data penilaian untuk diunduh.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Tanggal,Periode,Kelas,Kategori,SkorDisiplin,UsageReport,SkorKehadiran,SkorHelm,SkorTerlambat,Juri,Catatan\n';

    records.forEach((r) => {
      const d = r.disiplinDetail;
      const row = [
        r.id,
        r.tanggal,
        r.periodeId,
        `"Kelas ${r.kelasNama}"`,
        `"${r.kategoriNama}"`,
        r.nilai,
        d ? `${d.usageReport.skor}%` : '-',
        d ? d.kehadiran.skor : '-',
        d ? `${d.helm.skor}%` : '-',
        d ? `${d.terlambat.skor}%` : '-',
        `"${r.guruNama}"`,
        `"${(r.catatan || '').replace(/"/g, '""')}"`,
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Disiplin_SMPN7_${activePeriode.nama.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSiswa = async (siswaId: string) => {
    await dataStore.deleteSiswa(siswaId);
    triggerRefresh();
  };

  const handleDeleteAllSiswa = async () => {
    await dataStore.deleteAllSiswa();
    triggerRefresh();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col justify-between">
      <div>
        <Header
          currentView={currentView}
          onNavigate={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          activePeriodeName={activePeriode.nama}
          settings={settings}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {currentView === 'dashboard' && (
            <PublicDashboard overview={overview} onSelectCategory={handleSelectCategory} />
          )}

          {currentView === 'detail' && (
            <CategoryDetail
              summary={selectedCategorySummary}
              allEvaluations={allEvaluations}
              onBack={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'login' && (
            <LoginPage onLogin={handleLogin} errorMessage={loginError} settings={settings} />
          )}

          {currentView === 'guru' && currentUser && (
            <TeacherPortal
              currentUser={currentUser}
              kelasList={kelasList}
              kategoriList={kategoriList}
              activePeriode={activePeriode}
              teacherEvaluations={teacherEvaluations}
              getSiswaByKelas={(kId) => dataStore.getSiswaListByKelas(kId)}
              onSubmitPenilaianDisiplin={handleSubmitPenilaianDisiplin}
              onUpdatePenilaian={handleUpdatePenilaian}
            />
          )}

          {currentView === 'admin' && currentUser?.role === 'admin' && (
            <AdminPortal
              users={users}
              kelasList={kelasList}
              siswaList={siswaList}
              periodeList={periodeList}
              allEvaluations={allEvaluations}
              logs={logs}
              settings={settings}
              onAddUser={handleAddUser}
              onResetPassword={handleResetPassword}
              onToggleUserStatus={handleToggleUserStatus}
              onAddKelas={handleAddKelas}
              onAddSiswa={handleAddSiswa}
              onDeleteSiswa={handleDeleteSiswa}
              onDeleteAllSiswa={handleDeleteAllSiswa}
              onImportSiswaCSV={handleImportSiswaCSV}
              onCreatePeriode={handleCreatePeriode}
              onSetActivePeriode={handleSetActivePeriode}
              onDeleteEvaluation={handleDeleteEvaluation}
              onUpdateSettings={handleUpdateSettings}
              onExportCSV={handleExportCSV}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="font-bold text-white">{settings.namaSekolah}</p>
            <p className="text-slate-400">{settings.alamatSekolah}</p>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="text-slate-300">
              Aplikasi Dashboard Prestasi Kelas &copy; {new Date().getFullYear()}
            </p>
            <p className="text-slate-500">{settings.kontak}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
