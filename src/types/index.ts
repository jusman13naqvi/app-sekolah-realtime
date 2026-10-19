export type Role = 'admin' | 'guru';

export interface User {
  id: string;
  username: string;
  nama: string;
  nip?: string;
  role: Role;
  status: 'aktif' | 'nonaktif';
  dibuatPada: string;
}

export interface Kelas {
  id: string;
  nama: string; // e.g. "7A"
  tingkat: number; // 7, 8, 9
  waliKelas?: string;
  status: 'aktif' | 'nonaktif';
}

export interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  kelasId: string;
  kelasNama: string;
}

export interface Kategori {
  id: string;
  nama: string;
  deskripsi: string;
  ikon: string;
  warna: string;
  status: 'aktif' | 'coming_soon';
}

export interface Periode {
  id: string;
  nama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'aktif' | 'arsip';
}

export interface SiswaDisiplinRecord {
  siswaId: string;
  nama: string;
  nisn: string;
  statusKehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  isiUsageReport: boolean; // Ya / Tidak
  pakaiHelm: boolean; // Ya / Tidak
  tepatWaktu: boolean; // Ya / Tidak
}

export interface PenilaianDisiplinDetail {
  usageReport: {
    totalSiswa: number;
    mengisi: number;
    skor: number; // (mengisi / totalSiswa) * 100
  };
  kehadiran: {
    hadir: number;
    izin: number; // -1 pt
    sakit: number; // -1 pt
    alpa: number; // -2 pt
    skor: number; // Math.max(0, 100 - (izin*1 + sakit*1 + alpa*2))
  };
  helm: {
    totalSiswa: number;
    patuh: number;
    skor: number; // (patuh / totalSiswa) * 100
  };
  terlambat: {
    totalSiswa: number;
    tepatWaktu: number;
    skor: number; // (tepatWaktu / totalSiswa) * 100
  };
  siswaDetail: SiswaDisiplinRecord[];
  skorTotalDisiplin: number; // Average of the 4 sub-indicator scores
}

export interface Penilaian {
  id: string;
  periodeId: string;
  tanggal: string; // YYYY-MM-DD
  kelasId: string;
  kelasNama: string;
  kategoriId: string;
  kategoriNama: string;
  nilai: number; // Final score (0 - 100)
  disiplinDetail?: PenilaianDisiplinDetail;
  catatan?: string;
  guruUsername: string;
  guruNama: string;
  dibuatPada: string;
  diubahPada?: string;
  diubahOleh?: string;
  alasanUbah?: string;
}

export interface LogAktivitas {
  id: string;
  waktu: string;
  username: string;
  nama: string;
  aksi: string;
  detail: string;
}

export interface Pengaturan {
  namaSekolah: string;
  judulDashboard: string;
  subjudulDashboard: string;
  logoUrl: string;
  alamatSekolah: string;
  kontak: string;
  gasWebAppUrl?: string;
}

export interface RekapKelasKategori {
  kelasId: string;
  kelasNama: string;
  kategoriId: string;
  kategoriNama: string;
  totalNilai: number;
  jumlahPenilaian: number; // Number of jurors who submitted scores
  jumlahJuri: number;
  juriList: Array<{ username: string; nama: string; nilai: number }>;
  rataRata: number | null;
  skorHarian: Record<string, number | null>;
  detailDisiplinAvg?: {
    usageReportAvg: number;
    kehadiranAvg: number;
    helmAvg: number;
    terlambatAvg: number;
  };
  statusKelengkapan: 'Lengkap' | 'Belum Lengkap';
  peringkat: number | null;
}

export interface RekapKategoriSummary {
  kategori: Kategori;
  rataRataKeseluruhan: number;
  kelasTertinggi: {
    kelasNama: string;
    rataRata: number;
  } | null;
  totalPenilaianMasuk: number;
  rekapKelas: RekapKelasKategori[];
  isPeringkatFinal: boolean;
}
