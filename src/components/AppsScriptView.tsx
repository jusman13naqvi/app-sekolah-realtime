import React, { useState } from 'react';
import { getGoogleAppsScriptBundle, GASFile } from '../services/appsScriptBundle';
import { FileCode, Copy, Check, ExternalLink, ShieldCheck, Database, Layers } from 'lucide-react';

export const AppsScriptView: React.FC = () => {
  const files = getGoogleAppsScriptBundle();
  const [selectedFile, setSelectedFile] = useState<GASFile>(files[0]);
  const [copiedFilename, setCopiedFilename] = useState<string | null>(null);

  const handleCopy = (content: string, filename: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFilename(filename);
    setTimeout(() => setCopiedFilename(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-500/30 space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold border border-amber-400/30">
          <FileCode className="w-3.5 h-3.5" />
          <span>Panduan & Kode Sumber Google Apps Script</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Kode Google Apps Script SI-Prestasi Kelas
        </h1>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Seluruh kode di bawah ini siap disalin langsung ke editor <strong>Google Apps Script (script.google.com)</strong> yang terhubung dengan Google Sheets sekolah Anda.
        </p>
      </div>

      {/* Deployment Guide Steps */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>Langkah-Langkah Deployment Web App Google Apps Script</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-1">
              1
            </span>
            <strong className="block font-bold text-slate-900">Buat Google Spreadsheet Baru</strong>
            <p className="text-slate-600 leading-relaxed">
              Buka Google Sheets di akun Google Sekolah. Buka menu <em>Ekstensi &gt; Apps Script</em>.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-1">
              2
            </span>
            <strong className="block font-bold text-slate-900">Jalankan Fungsi Inisialisasi Database</strong>
            <p className="text-slate-600 leading-relaxed">
              Salin kode <code>Setup.gs</code> lalu jalankan fungsi <code>setupApp()</code>. Ketujuh sheet otomatis dibuat tanpa menghapus data lama.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-1">
              3
            </span>
            <strong className="block font-bold text-slate-900">Terapkan Sebagai Aplikasi Web (Web App)</strong>
            <p className="text-slate-600 leading-relaxed">
              Klik <em>Terapkan &gt; Penerapan Baru &gt; Aplikasi Web</em>. Atur "Akses" ke <strong>Siapa Saja (Anyone)</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Code Inspector & Exporter */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-4">
        {/* File Sidebar */}
        <div className="bg-slate-50 border-r border-slate-200 p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
            Berkas Google Apps Script
          </span>
          {files.map((f) => {
            const isSelected = selectedFile.filename === f.filename;
            return (
              <button
                key={f.filename}
                onClick={() => setSelectedFile(f)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200/60 font-medium'
                }`}
              >
                <span className="font-mono">{f.filename}</span>
                <span className="text-[10px] uppercase opacity-75">{f.type}</span>
              </button>
            );
          })}
        </div>

        {/* Code View Area */}
        <div className="md:col-span-3 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-mono font-bold text-base text-slate-900">{selectedFile.filename}</h3>
                <p className="text-xs text-slate-500">{selectedFile.description}</p>
              </div>

              <button
                onClick={() => handleCopy(selectedFile.content, selectedFile.filename)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedFilename === selectedFile.filename ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed select-all">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
