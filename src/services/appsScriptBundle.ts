export interface GASFile {
  filename: string;
  type: 'gs' | 'html';
  description: string;
  content: string;
}

export function getGoogleAppsScriptBundle(): GASFile[] {
  return [
    {
      filename: 'Setup.gs',
      type: 'gs',
      description: 'Pembuatan database Google Sheets otomatis (7 sheets: USERS, KELAS, KATEGORI, PERIODE, PENILAIAN, LOG_AKTIVITAS, PENGATURAN)',
      content: `/**
 * ============================================================================
 * DASHBOARD PRESTASI KELAS - SMP NEGERI 7 MUARA BADAK
 * File: Setup.gs
 * Deskripsi: Inisialisasi Google Sheets Database & Akun Admin Pertama
 * ============================================================================
 */

function setupApp() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet USERS
  var sheetUsers = getOrCreateSheet(ss, "USERS");
  if (sheetUsers.getLastRow() === 0) {
    sheetUsers.appendRow(["ID", "Username", "Nama", "NIP", "PasswordHash", "Role", "Status", "DibuatPada"]);
    sheetUsers.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    
    // Default Admin (Password: admin123)
    sheetUsers.appendRow([
      "usr-admin",
      "admin",
      "Administrator Utama",
      "198503152010011005",
      hashPassword("admin123"),
      "admin",
      "aktif",
      new Date().toISOString()
    ]);
    
    // Default Guru 1
    sheetUsers.appendRow([
      "usr-guru1",
      "guru1",
      "Budi Santoso, S.Pd.",
      "198807202014021003",
      hashPassword("guru123"),
      "guru",
      "aktif",
      new Date().toISOString()
    ]);
  }

  // 2. Sheet KELAS
  var sheetKelas = getOrCreateSheet(ss, "KELAS");
  if (sheetKelas.getLastRow() === 0) {
    sheetKelas.appendRow(["ID", "NamaKelas", "Tingkat", "WaliKelas", "Status"]);
    sheetKelas.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    
    var defaultKelas = [
      ["7a", "7A", 7, "Dra. Endang Sulastri", "aktif"],
      ["7b", "7B", 7, "Rudi Hermawan, S.Pd.", "aktif"],
      ["8a", "8A", 8, "Nurhayati, S.Si.", "aktif"],
      ["8b", "8B", 8, "Slamet Riyadi, S.Pd.", "aktif"],
      ["8c", "8C", 8, "Dewi Lestari, M.Pd.", "aktif"],
      ["9a", "9A", 9, "Bambang Prasetyo, S.Pd.", "aktif"],
      ["9b", "9B", 9, "Sri Wahyuni, S.Pd.", "aktif"]
    ];
    defaultKelas.forEach(function(row) { sheetKelas.appendRow(row); });
  }

  // 3. Sheet KATEGORI
  var sheetKategori = getOrCreateSheet(ss, "KATEGORI");
  if (sheetKategori.getLastRow() === 0) {
    sheetKategori.appendRow(["ID", "NamaKategori", "Deskripsi", "Ikon", "Warna"]);
    sheetKategori.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    
    var defaultKategori = [
      ["disiplin", "Kelas Disiplin", "Kedisiplinan kehadiran, ketepatan waktu, dan kerapihan.", "ShieldCheck", "amber"],
      ["terbersih", "Kelas Terbersih", "Kebersihan kelas, keasrian, dan sampah.", "Sparkles", "emerald"],
      ["kreatif", "Kelas Kreatif", "Kreativitas mading dan pojok baca.", "Palette", "purple"],
      ["taat_aturan", "Kelas Taat Aturan/Patuh", "Kepatuhan tata tertib dan kesopanan.", "CheckCircle", "blue"],
      ["berprestasi", "Kelas Berprestasi", "Pencapaian akademis dan keaktifan.", "Trophy", "rose"]
    ];
    defaultKategori.forEach(function(row) { sheetKategori.appendRow(row); });
  }

  // 4. Sheet PERIODE
  var sheetPeriode = getOrCreateSheet(ss, "PERIODE");
  if (sheetPeriode.getLastRow() === 0) {
    sheetPeriode.appendRow(["ID", "NamaPeriode", "TanggalMulai", "TanggalSelesai", "Status"]);
    sheetPeriode.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    sheetPeriode.appendRow(["per-1", "Minggu Ke-3 Oktober 2026", "2026-10-13", "2026-10-18", "aktif"]);
  }

  // 5. Sheet PENILAIAN
  var sheetPenilaian = getOrCreateSheet(ss, "PENILAIAN");
  if (sheetPenilaian.getLastRow() === 0) {
    sheetPenilaian.appendRow([
      "ID", "PeriodeID", "Tanggal", "KelasID", "KelasNama", 
      "KategoriID", "KategoriNama", "Nilai", "Catatan", 
      "GuruUsername", "GuruNama", "DibuatPada", "DiubahPada", "DiubahOleh", "AlasanUbah"
    ]);
    sheetPenilaian.getRange(1, 1, 1, 15).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
  }

  // 6. Sheet LOG_AKTIVITAS
  var sheetLog = getOrCreateSheet(ss, "LOG_AKTIVITAS");
  if (sheetLog.getLastRow() === 0) {
    sheetLog.appendRow(["ID", "Waktu", "Username", "Nama", "Aksi", "Detail"]);
    sheetLog.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
  }

  // 7. Sheet PENGATURAN
  var sheetPengaturan = getOrCreateSheet(ss, "PENGATURAN");
  if (sheetPengaturan.getLastRow() === 0) {
    sheetPengaturan.appendRow(["Key", "Value"]);
    sheetPengaturan.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    
    sheetPengaturan.appendRow(["namaSekolah", "SMP Negeri 7 Muara Badak"]);
    sheetPengaturan.appendRow(["judulDashboard", "Dashboard Prestasi Kelas"]);
    sheetPengaturan.appendRow(["subjudulDashboard", "Pemantauan Karakter, Kebersihan, Kreativitas, Kepatuhan, dan Prestasi Siswa"]);
    sheetPengaturan.appendRow(["logoUrl", ""]);
    sheetPengaturan.appendRow(["alamatSekolah", "Jl. Poros Muara Badak No. 07, Kutai Kartanegara"]);
  }

  Logger.log("Inisialisasi Database SMP Negeri 7 Muara Badak Berhasil!");
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function hashPassword(pass) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pass);
  var txt = "";
  for (var i = 0; i < rawHash.length; i++) {
    var byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    var byteStr = byteVal.toString(16);
    if (byteStr.length == 1) byteStr = "0" + byteStr;
    txt += byteStr;
  }
  return txt;
}
`,
    },
    {
      filename: 'Code.gs',
      type: 'gs',
      description: 'Main Controller, Router, & API Endpoints untuk Google Apps Script Web App',
      content: `/**
 * ============================================================================
 * DASHBOARD PRESTASI KELAS - SMP NEGERI 7 MUARA BADAK
 * File: Code.gs
 * Deskripsi: Routing Web App (doGet) & Handling Client RPCs
 * ============================================================================
 */

function doGet(e) {
  var page = e.parameter.page || "index";
  var template;
  
  if (page === "detail") {
    template = HtmlService.createTemplateFromFile("DetailKategori");
  } else if (page === "login") {
    template = HtmlService.createTemplateFromFile("Login");
  } else if (page === "guru") {
    template = HtmlService.createTemplateFromFile("Guru");
  } else if (page === "admin") {
    template = HtmlService.createTemplateFromFile("Admin");
  } else {
    template = HtmlService.createTemplateFromFile("Index");
  }

  return template.evaluate()
    .setTitle("Dashboard Prestasi Kelas - SMP Negeri 7 Muara Badak")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function apiGetPublicDashboard() {
  return getDashboardOverviewData();
}

function apiGetCategoryDetail(kategoriId) {
  return getRekapKategoriData(kategoriId);
}

function apiLoginUser(username, password) {
  return handleUserLogin(username, password);
}

function apiSimpanPenilaian(payload, token) {
  var session = validateToken(token);
  if (!session) throw new Error("Akses ditolak. Sesi tidak valid.");
  return simpanPenilaianHarian(payload, session.user);
}

function apiGetAdminUsers(token) {
  verifyAdminAccess(token);
  return getAllUsersData();
}

function apiExportCSV(token) {
  verifyAdminAccess(token);
  return generateCSVExport();
}
`,
    },
    {
      filename: 'Auth.gs',
      type: 'gs',
      description: 'Autentikasi, Pengelolaan Sesi, Hak Akses, & Password Hashing',
      content: `/**
 * File: Auth.gs
 * Fungsi Login, Sesi, Validasi Token, & Logout
 */

function handleUserLogin(username, password) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("USERS");
  var data = sheet.getDataRange().getValues();
  var passHash = hashPassword(password);

  for (var i = 1; i < data.length; i++) {
    var uName = data[i][1];
    var pHash = data[i][4];
    var status = data[i][6];

    if (uName.toString().toLowerCase() === username.toLowerCase().trim()) {
      if (status !== "aktif") {
        return { success: false, message: "Akun Anda telah dinonaktifkan." };
      }
      if (pHash === passHash) {
        var user = {
          id: data[i][0],
          username: data[i][1],
          nama: data[i][2],
          nip: data[i][3],
          role: data[i][5],
          status: data[i][6]
        };
        var token = "token-" + user.id + "-" + new Date().getTime();
        
        // Save session in UserProperties
        PropertiesService.getScriptProperties().setProperty(token, JSON.stringify(user));
        catatLog(user.username, user.nama, "LOGIN", "Login berhasil via Google Apps Script");

        return { success: true, user: user, token: token };
      }
    }
  }

  catatLog(username, username, "LOGIN_GAGAL", "Gagal login. Username atau password salah.");
  return { success: false, message: "Username atau password salah!" };
}

function validateToken(token) {
  if (!token) return null;
  var json = PropertiesService.getScriptProperties().getProperty(token);
  if (!json) return null;
  return { user: JSON.parse(json) };
}

function verifyAdminAccess(token) {
  var session = validateToken(token);
  if (!session || session.user.role !== "admin") {
    throw new Error("Akses Khusus Administrator!");
  }
  return session.user;
}
`,
    },
    {
      filename: 'Penilaian.gs',
      type: 'gs',
      description: 'Penyimpanan Penilaian, LockService untuk Cegah Konflik Data, & Pencegahan Duplikasi',
      content: `/**
 * File: Penilaian.gs
 * Penyimpanan Penilaian Harian & Pencegahan Duplikasi
 */

function simpanPenilaianHarian(payload, user) {
  var lock = LockService.getScriptLock();
  try {
    // Lock up to 10 seconds to prevent race conditions
    lock.waitLock(10000);
  } catch (e) {
    throw new Error("Sistem sedang sibuk. Silakan coba beberapa detik lagi.");
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("PENILAIAN");
    var data = sheet.getDataRange().getValues();

    // Check duplicate evaluation (Date + Class + Category + Teacher)
    for (var i = 1; i < data.length; i++) {
      var pTanggal = data[i][2];
      var pKelasId = data[i][3];
      var pKatId = data[i][5];
      var pGuru = data[i][9];

      if (pTanggal === payload.tanggal && pKelasId === payload.kelasId && pKatId === payload.kategoriId && pGuru === user.username) {
        throw new Error("Penilaian ganda terdeteksi! Nilai untuk kelas & kategori ini pada tanggal tersebut sudah pernah Anda input.");
      }
    }

    var id = "pen-" + new Date().getTime();
    var now = new Date().toISOString();

    sheet.appendRow([
      id,
      payload.periodeId,
      payload.tanggal,
      payload.kelasId,
      payload.kelasNama,
      payload.kategoriId,
      payload.kategoriNama,
      Number(payload.nilai),
      payload.catatan || "",
      user.username,
      user.nama,
      now,
      "",
      "",
      ""
    ]);

    catatLog(user.username, user.nama, "INPUT_PENILAIAN", "Input nilai " + payload.nilai + " untuk kelas " + payload.kelasNama);
    return { success: true, message: "Penilaian berhasil disimpan!" };

  } finally {
    lock.releaseLock();
  }
}

function catatLog(username, nama, aksi, detail) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("LOG_AKTIVITAS");
  sheet.appendRow(["log-" + new Date().getTime(), new Date().toISOString(), username, nama, aksi, detail]);
}
`,
    },
    {
      filename: 'Rekap.gs',
      type: 'gs',
      description: 'Algoritma Perhitungan Rekap Mingguan & Penentuan Peringkat',
      content: `/**
 * File: Rekap.gs
 * Perhitungan Rata-rata & Peringkat Mingguan
 */

function getRekapKategoriData(kategoriId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPen = ss.getSheetByName("PENILAIAN");
  var sheetKelas = ss.getSheetByName("KELAS");
  
  var dataPen = sheetPen.getDataRange().getValues();
  var dataKelas = sheetKelas.getDataRange().getValues();

  var result = [];
  
  for (var i = 1; i < dataKelas.length; i++) {
    var kId = dataKelas[i][0];
    var kNama = dataKelas[i][1];
    var kStatus = dataKelas[i][4];

    if (kStatus !== "aktif") continue;

    var sum = 0;
    var count = 0;

    for (var j = 1; j < dataPen.length; j++) {
      if (dataPen[j][3] === kId && dataPen[j][5] === kategoriId) {
        sum += Number(dataPen[j][7]);
        count++;
      }
    }

    var avg = count > 0 ? (sum / count).toFixed(2) : null;
    result.push({
      kelasId: kId,
      kelasNama: kNama,
      totalNilai: sum,
      jumlahPenilaian: count,
      rataRata: avg,
      statusKelengkapan: count >= 3 ? "Lengkap" : "Belum Lengkap"
    });
  }

  return result;
}
`,
    },
  ];
}
