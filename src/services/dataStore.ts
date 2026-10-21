import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  User,
  Kelas,
  Siswa,
  Kategori,
  Periode,
  Penilaian,
  PenilaianDisiplinDetail,
  LogAktivitas,
  Pengaturan,
  RekapKelasKategori,
  RekapKategoriSummary,
} from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const INITIAL_KATEGORI: Kategori[] = [
  {
    id: 'disiplin',
    nama: 'Kelas Disiplin',
    deskripsi: 'Penilaian komprehensif: Usage Report, Kehadiran, Kepatuhan Helm, dan Ketepatan Waktu.',
    ikon: 'ShieldCheck',
    warna: 'amber',
    status: 'aktif',
  },
  {
    id: 'terbersih',
    nama: 'Kelas Terbersih',
    deskripsi: 'Kebersihan ruang kelas, keasrian lingkungan, dan pengelolaan sampah.',
    ikon: 'Sparkles',
    warna: 'emerald',
    status: 'coming_soon',
  },
  {
    id: 'kreatif',
    nama: 'Kelas Kreatif',
    deskripsi: 'Kreativitas mading, dekorasi edukatif, dan inovasi pojok baca kelas.',
    ikon: 'Palette',
    warna: 'purple',
    status: 'coming_soon',
  },
  {
    id: 'taat_aturan',
    nama: 'Kelas Taat Aturan/Patuh',
    deskripsi: 'Kepatuhan terhadap tata tertib sekolah, kesopanan, dan tata krama.',
    ikon: 'CheckCircle',
    warna: 'blue',
    status: 'coming_soon',
  },
  {
    id: 'berprestasi',
    nama: 'Kelas Berprestasi',
    deskripsi: 'Pencapaian akademis, keaktifan pembelajaran, dan kejuaraan siswa.',
    ikon: 'Trophy',
    warna: 'rose',
    status: 'coming_soon',
  },
];

export const INITIAL_KELAS: Kelas[] = [
  { id: '7a', nama: '7A', tingkat: 7, waliKelas: 'Dra. Endang Sulastri', status: 'aktif' },
  { id: '7b', nama: '7B', tingkat: 7, waliKelas: 'Rudi Hermawan, S.Pd.', status: 'aktif' },
  { id: '8a', nama: '8A', tingkat: 8, waliKelas: 'Nurhayati, S.Si.', status: 'aktif' },
  { id: '8b', nama: '8B', tingkat: 8, waliKelas: 'Slamet Riyadi, S.Pd.', status: 'aktif' },
  { id: '8c', nama: '8C', tingkat: 8, waliKelas: 'Dewi Lestari, M.Pd.', status: 'aktif' },
  { id: '9a', nama: '9A', tingkat: 9, waliKelas: 'Bambang Prasetyo, S.Pd.', status: 'aktif' },
  { id: '9b', nama: '9B', tingkat: 9, waliKelas: 'Sri Wahyuni, S.Pd.', status: 'aktif' },
];

export const INITIAL_PERIODE: Periode[] = [
  {
    id: 'per-2026-w42',
    nama: 'Minggu Ke-3 Oktober 2026',
    tanggalMulai: '2026-10-12',
    tanggalSelesai: '2026-10-17',
    status: 'aktif',
  },
];

export const INITIAL_PENGATURAN: Pengaturan = {
  namaSekolah: 'SMP Negeri 7 Muara Badak',
  judulDashboard: 'Dashboard Prestasi Kelas',
  subjudulDashboard: 'Pemantauan Karakter, Kebersihan, Kreativitas, Kepatuhan, dan Prestasi Siswa',
  logoUrl: '',
  alamatSekolah: 'Jl. Poros Muara Badak No. 07, Kutai Kartanegara, Kalimantan Timur',
  kontak: 'smpn7muarabadak@sch.id | (0541) 789123',
};

export function computeDisiplinScore(
  usageReportObj: { totalSiswa: number; mengisi: number },
  kehadiranObj: { hadir: number; izin: number; sakit: number; alpa: number },
  helmObj: { totalSiswa: number; patuh: number },
  terlambatObj: { totalSiswa: number; tepatWaktu: number }
) {
  const usageScore =
    usageReportObj.totalSiswa > 0
      ? Number(((usageReportObj.mengisi / usageReportObj.totalSiswa) * 100).toFixed(2))
      : 100;

  const deduction = kehadiranObj.izin * 1 + kehadiranObj.sakit * 1 + kehadiranObj.alpa * 2;
  const kehadiranScore = Math.max(0, 100 - deduction);

  const helmScore =
    helmObj.totalSiswa > 0
      ? Number(((helmObj.patuh / helmObj.totalSiswa) * 100).toFixed(2))
      : 100;

  const terlambatScore =
    terlambatObj.totalSiswa > 0
      ? Number(((terlambatObj.tepatWaktu / terlambatObj.totalSiswa) * 100).toFixed(2))
      : 100;

  const skorTotalDisiplin = Number(
    ((usageScore + kehadiranScore + helmScore + terlambatScore) / 4).toFixed(2)
  );

  return {
    usageReport: { ...usageReportObj, skor: usageScore },
    kehadiran: { ...kehadiranObj, skor: kehadiranScore },
    helm: { ...helmObj, skor: helmScore },
    terlambat: { ...terlambatObj, skor: terlambatScore },
    skorTotalDisiplin,
  };
}

class RealtimeDataStoreService {
  private users: User[] = [];
  private kelasList: Kelas[] = [];
  private siswaList: Siswa[] = [];
  private kategoriList: Kategori[] = INITIAL_KATEGORI;
  private periodeList: Periode[] = [];
  private penilaianList: Penilaian[] = [];
  private logList: LogAktivitas[] = [];
  private settings: Pengaturan = INITIAL_PENGATURAN;
  private passwords: Record<string, string> = { admin: 'admin123' };

  private isConnected = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.initRealtimeSync();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getIsConnected() {
    return this.isConnected;
  }

  private async initRealtimeSync() {
    try {
      // 1. Users Listener
      onSnapshot(
        collection(db, 'users'),
        async (snapshot) => {
          this.isConnected = true;
          if (snapshot.empty) {
            // Seed initial admin user if collection is empty
            const defaultAdmin: User = {
              id: 'usr-admin',
              username: 'admin',
              nama: 'Administrator Utama',
              nip: '198503152010011005',
              role: 'admin',
              status: 'aktif',
              dibuatPada: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', 'usr-admin'), { ...defaultAdmin, pass: 'admin123' });
          } else {
            const loadedUsers: User[] = [];
            const loadedPass: Record<string, string> = {};
            snapshot.docs.forEach((d) => {
              const data = d.data();
              loadedUsers.push({
                id: d.id,
                username: data.username || 'admin',
                nama: data.nama || 'Admin',
                nip: data.nip || '',
                role: data.role || 'admin',
                status: data.status || 'aktif',
                dibuatPada: data.dibuatPada || new Date().toISOString(),
              });
              if (data.pass) {
                loadedPass[data.username] = data.pass;
              }
            });
            this.users = loadedUsers;
            this.passwords = { admin: 'admin123', ...loadedPass };
          }
          this.notify();
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'users')
      );

      // 2. Kelas Listener
      onSnapshot(
        collection(db, 'kelas'),
        (snapshot) => {
          const loaded: Kelas[] = [];
          snapshot.docs.forEach((d) => loaded.push({ id: d.id, ...(d.data() as Omit<Kelas, 'id'>) }));
          this.kelasList = loaded;
          this.notify();
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'kelas')
      );

      // 3. Siswa Listener
      onSnapshot(
        collection(db, 'siswa'),
        (snapshot) => {
          const loaded: Siswa[] = [];
          snapshot.docs.forEach((d) => loaded.push({ id: d.id, ...(d.data() as Omit<Siswa, 'id'>) }));
          this.siswaList = loaded;
          this.notify();
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'siswa')
      );

      // 4. Periode Listener
      onSnapshot(
        collection(db, 'periode'),
        async (snapshot) => {
          if (snapshot.empty) {
            for (const p of INITIAL_PERIODE) {
              await setDoc(doc(db, 'periode', p.id), p);
            }
          } else {
            const loaded: Periode[] = [];
            snapshot.docs.forEach((d) => loaded.push(d.data() as Periode));
            this.periodeList = loaded;
          }
          this.notify();
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'periode')
      );

      // 5. Penilaian Listener
      onSnapshot(
        collection(db, 'penilaian'),
        (snapshot) => {
          const loaded: Penilaian[] = [];
          snapshot.docs.forEach((d) => loaded.push({ id: d.id, ...(d.data() as Omit<Penilaian, 'id'>) }));
          this.penilaianList = loaded;
          this.notify();
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'penilaian')
      );

      // 6. Logs Listener
      onSnapshot(
        query(collection(db, 'logs'), orderBy('waktu', 'desc'), limit(100)),
        (snapshot) => {
          const loaded: LogAktivitas[] = [];
          snapshot.docs.forEach((d) => loaded.push({ id: d.id, ...(d.data() as Omit<LogAktivitas, 'id'>) }));
          this.logList = loaded;
          this.notify();
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'logs')
      );

      // 7. Pengaturan Listener
      onSnapshot(
        doc(db, 'pengaturan', 'default'),
        async (snapshot) => {
          if (!snapshot.exists()) {
            await setDoc(doc(db, 'pengaturan', 'default'), INITIAL_PENGATURAN);
          } else {
            this.settings = { ...INITIAL_PENGATURAN, ...snapshot.data() } as Pengaturan;
          }
          this.notify();
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'pengaturan/default')
      );
    } catch (err) {
      console.error('Realtime Firestore sync initialization failed:', err);
    }
  }

  public async addLog(username: string, nama: string, aksi: string, detail: string) {
    const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const logData: LogAktivitas = {
      id: logId,
      waktu: new Date().toISOString(),
      username,
      nama,
      aksi,
      detail,
    };
    try {
      await setDoc(doc(db, 'logs', logId), logData);
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  }

  public getLogs(): LogAktivitas[] {
    return [...this.logList];
  }

  public getAllSiswa(): Siswa[] {
    return [...this.siswaList];
  }

  public getSiswaListByKelas(kelasId: string): Siswa[] {
    return this.siswaList.filter((s) => s.kelasId === kelasId);
  }

  public async addSiswa(siswaData: Omit<Siswa, 'id'>): Promise<Siswa> {
    const sId = `sis-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newSiswa: Siswa = { ...siswaData, id: sId };
    try {
      await setDoc(doc(db, 'siswa', sId), newSiswa);
      await this.addLog(
        'admin',
        'Administrator',
        'TAMBAH_SISWA',
        `Menambahkan siswa baru secara online: ${newSiswa.nama} (${newSiswa.kelasNama})`
      );
      return newSiswa;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `siswa/${sId}`);
      throw err;
    }
  }

  public async deleteSiswa(siswaId: string): Promise<void> {
    try {
      const idx = this.siswaList.findIndex((s) => s.id === siswaId);
      const targetName = idx !== -1 ? this.siswaList[idx].nama : siswaId;
      await deleteDoc(doc(db, 'siswa', siswaId));
      await this.addLog('admin', 'Administrator', 'HAPUS_SISWA', `Menghapus siswa: ${targetName}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `siswa/${siswaId}`);
      throw err;
    }
  }

  public async deleteAllSiswa(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'siswa'));
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, 'siswa', d.id));
      }
      await this.addLog('admin', 'Administrator', 'HAPUS_SEMUA_SISWA', `Menghapus seluruh data siswa di database online.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'siswa');
      throw err;
    }
  }

  public async importSiswaCSV(csvContent: string): Promise<{ importedCount: number; errors: string[] }> {
    const lines = csvContent.split(/\r?\n/);
    let importedCount = 0;
    const errors: string[] = [];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (
        !line.trim() ||
        (index === 0 &&
          (line.toLowerCase().includes('nama') || line.toLowerCase().includes('nisn')))
      ) {
        continue;
      }

      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < 3) continue;

      let nama = '';
      let kelasNama = '';
      let nisn = '';

      if (parts.length >= 4) {
        nama = parts[1];
        kelasNama = parts[2];
        nisn = parts[3];
      } else {
        nama = parts[0];
        kelasNama = parts[1];
        nisn = parts[2];
      }

      if (!nama || !kelasNama) {
        errors.push(`Baris ${index + 1}: Data nama atau kelas tidak valid.`);
        continue;
      }

      const kelasObj = this.kelasList.find((k) => k.nama.toUpperCase() === kelasNama.toUpperCase());
      const kId = kelasObj ? kelasObj.id : kelasNama.toLowerCase().replace(/\s+/g, '');
      const kNama = kelasObj ? kelasObj.nama : kelasNama.toUpperCase();

      const docId = `sis-${Date.now()}-${index}`;
      const siswaItem: Siswa = {
        id: docId,
        nisn: nisn || `008${Math.floor(10000000 + Math.random() * 90000000)}`,
        nama,
        kelasId: kId,
        kelasNama: kNama,
      };

      try {
        await setDoc(doc(db, 'siswa', docId), siswaItem);
        importedCount++;
      } catch (err) {
        console.error('Error saving imported student:', err);
      }
    }

    await this.addLog('admin', 'Administrator', 'IMPORT_SISWA', `Mengimpor ${importedCount} data siswa ke Firestore.`);
    return { importedCount, errors };
  }

  public async validateCredentials(
    username: string,
    passwordAttempt: string
  ): Promise<{ user: User; token: string } | null> {
    const uClean = username.toLowerCase().trim();
    const user = this.users.find((u) => u.username.toLowerCase() === uClean && u.status === 'aktif');
    if (!user) return null;

    const storedPass = this.passwords[user.username] || 'admin123';
    if (passwordAttempt === storedPass) {
      await this.addLog(user.username, user.nama, 'LOGIN_BERHASIL', 'Pengguna berhasil masuk ke sistem online.');
      return {
        user,
        token: `sess-${user.id}-${Date.now()}`,
      };
    }

    await this.addLog(username, username, 'LOGIN_GAGAL', 'Percobaan login dengan kata sandi salah.');
    return null;
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public async addUser(newUser: Omit<User, 'id' | 'dibuatPada'>, rawPass: string): Promise<User> {
    const existing = this.users.find(
      (u) => u.username.toLowerCase() === newUser.username.toLowerCase()
    );
    if (existing) {
      throw new Error(`Username "${newUser.username}" sudah digunakan!`);
    }

    const uId = `usr-${Date.now()}`;
    const userDoc: User & { pass: string } = {
      ...newUser,
      id: uId,
      dibuatPada: new Date().toISOString(),
      pass: rawPass || 'guru123',
    };

    try {
      await setDoc(doc(db, 'users', uId), userDoc);
      await this.addLog(
        'admin',
        'Administrator',
        'TAMBAH_USER',
        `Menambahkan pengguna baru online: ${userDoc.username} (${userDoc.nama})`
      );
      return userDoc;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uId}`);
      throw err;
    }
  }

  public async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('Pengguna tidak ditemukan!');

    try {
      await updateDoc(doc(db, 'users', userId), { pass: newPassword });
      await this.addLog(
        'admin',
        'Administrator',
        'RESET_PASSWORD',
        `Mengubah kata sandi untuk ${user.username} (${user.nama})`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
      throw err;
    }
  }

  public async toggleUserStatus(id: string): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('Pengguna tidak ditemukan');

    const nextStatus = user.status === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await updateDoc(doc(db, 'users', id), { status: nextStatus });
      await this.addLog(
        'admin',
        'Administrator',
        'STATUS_USER',
        `Mengubah status user ${user.username} menjadi ${nextStatus}`
      );
      return { ...user, status: nextStatus };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
      throw err;
    }
  }

  public async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('Pengguna tidak ditemukan!');

    const updatedUser: User = { ...user, ...userData };
    try {
      await updateDoc(doc(db, 'users', userId), {
        nama: updatedUser.nama,
        nip: updatedUser.nip || '',
        role: updatedUser.role,
        status: updatedUser.status,
      });
      await this.addLog(
        'admin',
        'Administrator',
        'UPDATE_USER',
        `Memperbarui data akun ${updatedUser.username} (${updatedUser.nama}, NIP: ${updatedUser.nip || '-'})`
      );
      return updatedUser;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
      throw err;
    }
  }

  public async deleteUser(userId: string): Promise<void> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('Pengguna tidak ditemukan!');

    try {
      await deleteDoc(doc(db, 'users', userId));
      await this.addLog(
        'admin',
        'Administrator',
        'HAPUS_USER',
        `Menghapus akun ${user.username} (${user.nama})`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
      throw err;
    }
  }

  public getKelasList(onlyActive = true): Kelas[] {
    if (onlyActive) {
      return this.kelasList.filter((k) => k.status === 'aktif');
    }
    return [...this.kelasList];
  }

  public async addKelas(kelasData: Omit<Kelas, 'id'>): Promise<Kelas> {
    const existing = this.kelasList.find(
      (k) => k.nama.toUpperCase() === kelasData.nama.toUpperCase()
    );
    if (existing) throw new Error(`Kelas ${kelasData.nama} sudah ada!`);

    const kId = kelasData.nama.toLowerCase().replace(/\s+/g, '');
    const kelasObj: Kelas = { ...kelasData, id: kId };

    try {
      await setDoc(doc(db, 'kelas', kId), kelasObj);
      await this.addLog('admin', 'Administrator', 'TAMBAH_KELAS', `Menambahkan kelas baru: ${kelasObj.nama}`);
      return kelasObj;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `kelas/${kId}`);
      throw err;
    }
  }

  public async updateKelas(id: string, kelasData: Partial<Omit<Kelas, 'id'>>): Promise<Kelas> {
    const idx = this.kelasList.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error('Kelas tidak ditemukan');

    const updated: Kelas = { ...this.kelasList[idx], ...kelasData };
    try {
      await setDoc(doc(db, 'kelas', id), updated);
      await this.addLog('admin', 'Administrator', 'UBAH_KELAS', `Memperbarui data kelas: ${updated.nama}`);
      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `kelas/${id}`);
      throw err;
    }
  }

  public async deleteKelas(id: string): Promise<void> {
    try {
      const idx = this.kelasList.findIndex((k) => k.id === id);
      const targetName = idx !== -1 ? this.kelasList[idx].nama : id;
      await deleteDoc(doc(db, 'kelas', id));
      await this.addLog('admin', 'Administrator', 'HAPUS_KELAS', `Menghapus kelas: ${targetName}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `kelas/${id}`);
      throw err;
    }
  }

  public async deleteAllKelas(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'kelas'));
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, 'kelas', d.id));
      }
      await this.addLog('admin', 'Administrator', 'HAPUS_SEMUA_KELAS', 'Menghapus seluruh data kelas di database.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'kelas');
      throw err;
    }
  }

  public async seedSampleKelas(): Promise<void> {
    try {
      for (const k of INITIAL_KELAS) {
        await setDoc(doc(db, 'kelas', k.id), k);
      }
      await this.addLog('admin', 'Administrator', 'SEED_KELAS', 'Mengisi ulang contoh daftar kelas standar (7A-9B).');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'kelas');
      throw err;
    }
  }

  public getKategoriList(): Kategori[] {
    return [...this.kategoriList];
  }

  public getPeriodeList(): Periode[] {
    return [...this.periodeList];
  }

  public getActivePeriode(): Periode {
    const active = this.periodeList.find((p) => p.status === 'aktif');
    if (active) return active;
    return this.periodeList[0] || INITIAL_PERIODE[0];
  }

  public async addPeriode(periodeData: Omit<Periode, 'id' | 'status'>, setAsActive = true): Promise<Periode> {
    if (setAsActive) {
      for (const p of this.periodeList) {
        if (p.status === 'aktif') {
          await updateDoc(doc(db, 'periode', p.id), { status: 'arsip' });
        }
      }
    }

    const pId = `per-${Date.now()}`;
    const newPeriode: Periode = {
      ...periodeData,
      id: pId,
      status: setAsActive ? 'aktif' : 'arsip',
    };

    try {
      await setDoc(doc(db, 'periode', pId), newPeriode);
      await this.addLog('admin', 'Administrator', 'TAMBAH_PERIODE', `Membuat periode baru: ${newPeriode.nama}`);
      return newPeriode;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `periode/${pId}`);
      throw err;
    }
  }

  public async setActivePeriode(id: string): Promise<Periode> {
    let target: Periode | null = null;
    for (const p of this.periodeList) {
      if (p.id === id) {
        await updateDoc(doc(db, 'periode', p.id), { status: 'aktif' });
        target = { ...p, status: 'aktif' };
      } else if (p.status === 'aktif') {
        await updateDoc(doc(db, 'periode', p.id), { status: 'arsip' });
      }
    }

    if (!target) throw new Error('Periode tidak ditemukan');
    await this.addLog('admin', 'Administrator', 'AKTIFKAN_PERIODE', `Mengubah periode aktif ke: ${target.nama}`);
    return target;
  }

  public async updatePeriode(id: string, periodeData: Partial<Omit<Periode, 'id'>>): Promise<Periode> {
    const idx = this.periodeList.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Periode tidak ditemukan');

    // If setting status to 'aktif', archive others
    if (periodeData.status === 'aktif') {
      for (const p of this.periodeList) {
        if (p.id !== id && p.status === 'aktif') {
          await updateDoc(doc(db, 'periode', p.id), { status: 'arsip' });
        }
      }
    }

    const updated: Periode = { ...this.periodeList[idx], ...periodeData };
    try {
      await setDoc(doc(db, 'periode', id), updated);
      await this.addLog('admin', 'Administrator', 'UBAH_PERIODE', `Memperbarui data periode: ${updated.nama}`);
      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `periode/${id}`);
      throw err;
    }
  }

  public async deletePeriode(id: string): Promise<void> {
    try {
      const idx = this.periodeList.findIndex((p) => p.id === id);
      const targetName = idx !== -1 ? this.periodeList[idx].nama : id;
      const wasActive = idx !== -1 ? this.periodeList[idx].status === 'aktif' : false;

      await deleteDoc(doc(db, 'periode', id));
      await this.addLog('admin', 'Administrator', 'HAPUS_PERIODE', `Menghapus periode: ${targetName}`);

      // If deleted period was active, set remaining period as active if available
      if (wasActive) {
        const remaining = this.periodeList.filter((p) => p.id !== id);
        if (remaining.length > 0) {
          await updateDoc(doc(db, 'periode', remaining[0].id), { status: 'aktif' });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `periode/${id}`);
      throw err;
    }
  }

  public getPenilaianList(periodeId?: string): Penilaian[] {
    const pid = periodeId || this.getActivePeriode().id;
    return this.penilaianList.filter((p) => p.periodeId === pid);
  }

  public async addPenilaianDisiplin(
    input: {
      tanggal: string;
      kelasId: string;
      disiplinDetail: PenilaianDisiplinDetail;
      catatan?: string;
    },
    user: User
  ): Promise<Penilaian> {
    const activePeriode = this.getActivePeriode();

    const existing = this.penilaianList.find(
      (p) =>
        p.periodeId === activePeriode.id &&
        p.tanggal === input.tanggal &&
        p.kelasId === input.kelasId &&
        p.kategoriId === 'disiplin' &&
        p.guruUsername === user.username
    );

    if (existing) {
      throw new Error(
        `Penilaian ganda terdeteksi! Anda (${user.nama}) sudah menginput nilai Disiplin untuk Kelas ini pada tanggal ${input.tanggal}. Gunakan fitur perbaikan nilai jika ada kesalahan.`
      );
    }

    const kelasObj = this.kelasList.find((k) => k.id === input.kelasId);
    if (!kelasObj) throw new Error('Kelas tidak ditemukan!');

    const pId = `pen-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record: Penilaian = {
      id: pId,
      periodeId: activePeriode.id,
      tanggal: input.tanggal,
      kelasId: input.kelasId,
      kelasNama: kelasObj.nama,
      kategoriId: 'disiplin',
      kategoriNama: 'Kelas Disiplin',
      nilai: input.disiplinDetail.skorTotalDisiplin,
      disiplinDetail: input.disiplinDetail,
      catatan: input.catatan || '',
      guruUsername: user.username,
      guruNama: user.nama,
      dibuatPada: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'penilaian', pId), record);
      await this.addLog(
        user.username,
        user.nama,
        'INPUT_DISIPLIN',
        `Juri menginput nilai Disiplin (${record.nilai}) untuk Kelas ${kelasObj.nama} (${input.tanggal})`
      );
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `penilaian/${pId}`);
      throw err;
    }
  }

  public async updatePenilaian(
    id: string,
    nilaiBaru: number,
    catatanBaru: string | undefined,
    alasanUbah: string,
    user: User
  ): Promise<Penilaian> {
    const idx = this.penilaianList.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Data penilaian tidak ditemukan');

    const old = this.penilaianList[idx];
    const updatePayload: Partial<Penilaian> = {
      nilai: Number(nilaiBaru.toFixed(2)),
      catatan: catatanBaru !== undefined ? catatanBaru : old.catatan,
      diubahPada: new Date().toISOString(),
      diubahOleh: `${user.nama} (${user.username})`,
      alasanUbah: alasanUbah || 'Perbaikan data nilai oleh pengajar/admin',
    };

    try {
      await updateDoc(doc(db, 'penilaian', id), updatePayload);
      await this.addLog(
        user.username,
        user.nama,
        'PERBAIKAN_PENILAIAN',
        `Memperbaiki nilai ${old.kelasNama} dari ${old.nilai} menjadi ${nilaiBaru}. Alasan: ${alasanUbah}`
      );
      return { ...old, ...updatePayload };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `penilaian/${id}`);
      throw err;
    }
  }

  public async deletePenilaian(id: string, alasan: string, user: User): Promise<void> {
    const idx = this.penilaianList.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Data penilaian tidak ditemukan');

    const deleted = this.penilaianList[idx];
    try {
      await deleteDoc(doc(db, 'penilaian', id));
      await this.addLog(
        user.username,
        user.nama,
        'BATAL_PENILAIAN',
        `Membatalkan penilaian ${deleted.kelasNama} tanggal ${deleted.tanggal}. Alasan: ${alasan}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `penilaian/${id}`);
      throw err;
    }
  }

  public getRekapKategori(kategoriId: string, periodeId?: string): RekapKategoriSummary {
    const periode = periodeId
      ? this.periodeList.find((p) => p.id === periodeId) || this.getActivePeriode()
      : this.getActivePeriode();

    const kategori = this.kategoriList.find((k) => k.id === kategoriId) || this.kategoriList[0];
    const activeClasses = this.getKelasList(true);

    const list = this.penilaianList.filter(
      (p) => p.periodeId === periode.id && p.kategoriId === kategoriId
    );

    let totalScoreSum = 0;
    let totalCount = 0;

    const rekapKelas: RekapKelasKategori[] = activeClasses.map((kelas) => {
      const classEvaluations = list.filter((p) => p.kelasId === kelas.id);

      const juriMap: Record<
        string,
        { username: string; nama: string; sum: number; count: number }
      > = {};
      classEvaluations.forEach((p) => {
        if (!juriMap[p.guruUsername]) {
          juriMap[p.guruUsername] = {
            username: p.guruUsername,
            nama: p.guruNama,
            sum: 0,
            count: 0,
          };
        }
        juriMap[p.guruUsername].sum += p.nilai;
        juriMap[p.guruUsername].count += 1;
      });

      const juriList = Object.values(juriMap).map((j) => ({
        username: j.username,
        nama: j.nama,
        nilai: Number((j.sum / j.count).toFixed(2)),
      }));

      const dateMap: Record<string, { sum: number; count: number }> = {};
      let usageSum = 0,
        kehadiranSum = 0,
        helmSum = 0,
        terlambatSum = 0,
        detailCount = 0;

      classEvaluations.forEach((p) => {
        if (!dateMap[p.tanggal]) {
          dateMap[p.tanggal] = { sum: 0, count: 0 };
        }
        dateMap[p.tanggal].sum += p.nilai;
        dateMap[p.tanggal].count += 1;

        if (p.disiplinDetail) {
          usageSum += p.disiplinDetail.usageReport.skor;
          kehadiranSum += p.disiplinDetail.kehadiran.skor;
          helmSum += p.disiplinDetail.helm.skor;
          terlambatSum += p.disiplinDetail.terlambat.skor;
          detailCount++;
        }
      });

      const skorHarian: Record<string, number | null> = {};
      Object.keys(dateMap).forEach((d) => {
        skorHarian[d] = Number((dateMap[d].sum / dateMap[d].count).toFixed(2));
      });

      let avg: number | null = null;
      let total = 0;
      const count = classEvaluations.length;

      if (count > 0) {
        total = classEvaluations.reduce((s, item) => s + item.nilai, 0);
        avg = Number((total / count).toFixed(2));
        totalScoreSum += total;
        totalCount += count;
      }

      const detailDisiplinAvg =
        detailCount > 0
          ? {
              usageReportAvg: Number((usageSum / detailCount).toFixed(2)),
              kehadiranAvg: Number((kehadiranSum / detailCount).toFixed(2)),
              helmAvg: Number((helmSum / detailCount).toFixed(2)),
              terlambatAvg: Number((terlambatSum / detailCount).toFixed(2)),
            }
          : undefined;

      const statusKelengkapan: 'Lengkap' | 'Belum Lengkap' =
        count >= 3 ? 'Lengkap' : 'Belum Lengkap';

      return {
        kelasId: kelas.id,
        kelasNama: kelas.nama,
        kategoriId: kategori.id,
        kategoriNama: kategori.nama,
        totalNilai: Number(total.toFixed(2)),
        jumlahPenilaian: count,
        jumlahJuri: juriList.length,
        juriList,
        rataRata: avg,
        skorHarian,
        detailDisiplinAvg,
        statusKelengkapan,
        peringkat: null,
      };
    });

    const evaluatedClasses = rekapKelas.filter((r) => r.rataRata !== null);
    evaluatedClasses.sort((a, b) => (b.rataRata as number) - (a.rataRata as number));

    let currentRank = 1;
    for (let i = 0; i < evaluatedClasses.length; i++) {
      if (i > 0 && evaluatedClasses[i].rataRata === evaluatedClasses[i - 1].rataRata) {
        evaluatedClasses[i].peringkat = evaluatedClasses[i - 1].peringkat;
      } else {
        evaluatedClasses[i].peringkat = currentRank;
      }
      currentRank++;
    }

    const overallAvg = totalCount > 0 ? Number((totalScoreSum / totalCount).toFixed(2)) : 0;
    const topClass =
      evaluatedClasses.length > 0 && evaluatedClasses[0].rataRata !== null
        ? {
            kelasNama: evaluatedClasses[0].kelasNama,
            rataRata: evaluatedClasses[0].rataRata as number,
          }
        : null;

    return {
      kategori,
      rataRataKeseluruhan: overallAvg,
      kelasTertinggi: topClass,
      totalPenilaianMasuk: totalCount,
      rekapKelas,
      isPeringkatFinal: totalCount >= 10,
    };
  }

  public getDashboardOverview(periodeId?: string) {
    const periode = periodeId
      ? this.periodeList.find((p) => p.id === periodeId) || this.getActivePeriode()
      : this.getActivePeriode();

    const categorySummaries = this.kategoriList.map((kat) => this.getRekapKategori(kat.id, periode.id));

    const activeClasses = this.getKelasList(true);
    const overallClassScores = activeClasses.map((kelas) => {
      let totalAvgSum = 0;
      let categoriesWithData = 0;

      categorySummaries.forEach((catSummary) => {
        if (catSummary.kategori.id === 'disiplin' || catSummary.kategori.status === 'aktif') {
          const item = catSummary.rekapKelas.find((r) => r.kelasId === kelas.id);
          if (item && item.rataRata !== null) {
            totalAvgSum += item.rataRata;
            categoriesWithData++;
          }
        }
      });

      const overallAvg = categoriesWithData > 0 ? Number((totalAvgSum / categoriesWithData).toFixed(2)) : 0;

      return {
        kelasId: kelas.id,
        kelasNama: kelas.nama,
        waliKelas: kelas.waliKelas,
        overallAvg,
        categoriesCount: categoriesWithData,
      };
    });

    overallClassScores.sort((a, b) => b.overallAvg - a.overallAvg);

    return {
      periode,
      pengaturan: this.settings,
      kategoriSummaries: categorySummaries,
      overallClassScores,
      terakhirDiperbarui: new Date().toLocaleTimeString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
    };
  }

  public getSettings(): Pengaturan {
    return { ...this.settings };
  }

  public async updateSettings(newSettings: Partial<Pengaturan>): Promise<Pengaturan> {
    const updated = { ...this.settings, ...newSettings };
    try {
      await setDoc(doc(db, 'pengaturan', 'default'), updated);
      await this.addLog('admin', 'Administrator', 'UBAH_PENGATURAN', 'Memperbarui logo / informasi dashboard sekolah secara realtime.');
      this.settings = updated;
      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'pengaturan/default');
      throw err;
    }
  }
}

export const dataStore = new RealtimeDataStoreService();
