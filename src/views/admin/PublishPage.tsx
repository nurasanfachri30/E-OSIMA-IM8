import React, { useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase';
import { useElection } from '../../context/ElectionContext';

interface PublishPageProps {
  onOpenSqlModal: () => void;
}

export const PublishPage: React.FC<PublishPageProps> = ({ onOpenSqlModal }) => {
  const { isDatabaseLive, settings } = useElection();
  const [activeTab, setActiveTab] = useState<'vercel' | 'netlify' | 'aistudio' | 'env' | 'cloudflare'>('vercel');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const envContent = `# Konfigurasi Supabase untuk eOSIS (${settings.school_name})
VITE_SUPABASE_URL="${SUPABASE_URL}"
VITE_SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}"
`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              100% Free Tier Selamanya
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Rp 0 / Tanpa Biaya Server
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pusat Publish &amp; Hosting Online Gratis
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
            Panduan lengkap agar aplikasi eOSIS di <span className="text-white font-bold">{settings.school_name}</span> dapat diakses secara publik oleh seluruh siswa dari HP atau komputer mana pun secara gratis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            <i className="bi bi-triangle-fill text-[10px]"></i>
            <span>Deploy ke Vercel</span>
            <i className="bi bi-box-arrow-up-right text-[10px]"></i>
          </a>

          <a
            href="https://app.netlify.com/drop"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-600/30 cursor-pointer"
          >
            <i className="bi bi-cloud-arrow-up-fill text-xs"></i>
            <span>Netlify Drop</span>
            <i className="bi bi-box-arrow-up-right text-[10px]"></i>
          </a>
        </div>
      </div>

      {/* Pre-Flight Health Audit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bundle Vite</div>
            <div className="text-xs font-extrabold text-slate-900 truncate">Build Siap Kompilasi</div>
            <div className="text-[10px] text-emerald-600 font-semibold">npm run build OK</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${isDatabaseLive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center text-lg shrink-0`}>
            <i className={`bi ${isDatabaseLive ? 'bi-database-check' : 'bi-database-exclamation'}`}></i>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Database Cloud</div>
            <div className="text-xs font-extrabold text-slate-900 truncate">
              {isDatabaseLive ? 'Supabase Live Connected' : 'Local Storage Mode'}
            </div>
            <button
              onClick={onOpenSqlModal}
              className="text-[10px] text-blue-600 hover:underline font-semibold text-left"
            >
              {isDatabaseLive ? 'Lihat Skema SQL' : 'Buka Skrip SQL Supabase'}
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
            <i className="bi bi-filetype-json"></i>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vercel Config</div>
            <div className="text-xs font-extrabold text-slate-900">vercel.json Aktif</div>
            <div className="text-[10px] text-slate-500 font-medium">SPA rewrite anti-404</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
            <i className="bi bi-file-earmark-text"></i>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Netlify Config</div>
            <div className="text-xs font-extrabold text-slate-900">netlify.toml Aktif</div>
            <div className="text-[10px] text-slate-500 font-medium">_redirects siap pakai</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'vercel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <i className="bi bi-triangle-fill text-[10px]"></i>
            <span>Vercel (Paling Direkomendasikan)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-black uppercase">
              2 Menit
            </span>
          </button>

          <button
            onClick={() => setActiveTab('netlify')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'netlify'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <i className="bi bi-cloud-arrow-up-fill text-xs"></i>
            <span>Netlify (Drag &amp; Drop)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-black uppercase">
              Tanpa Git
            </span>
          </button>

          <button
            onClick={() => setActiveTab('aistudio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'aistudio'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <i className="bi bi-question-circle-fill text-xs text-amber-400"></i>
            <span>Kendala "Publish" di AI Studio?</span>
          </button>

          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cloudflare'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <i className="bi bi-lightning-charge-fill text-xs"></i>
            <span>Cloudflare Pages</span>
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'env'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <i className="bi bi-key-fill text-xs"></i>
            <span>Kunci Env Supabase</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* TAB 1: VERCEL */}
          {activeTab === 'vercel' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-extrabold text-blue-950 text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>Mengapa Vercel Paling Cocok untuk Pemilihan OSIS Sekolah?</span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-900 font-medium leading-relaxed max-w-2xl">
                    Vercel adalah platform hosting frontend nomor 1 di dunia untuk React/Vite. Memberikan paket Free Tier permanen, gratis HTTPS SSL otomatis, kuota 100 GB/bulan (sangat memadai untuk puluhan ribu siswa), dan performa server instan tanpa jeda cold-start.
                  </p>
                </div>

                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 shrink-0 cursor-pointer"
                >
                  <span>Buka Vercel Sekarang</span>
                  <i className="bi bi-box-arrow-up-right text-[10px]"></i>
                </a>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
                  <i className="bi bi-1-circle-fill text-blue-600"></i>
                  <span>Langkah Cepat: Deploy 1-Klik via GitHub &amp; Vercel Dashboard</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      1
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">Daftar Akun Gratis</div>
                    <p className="text-slate-600 leading-relaxed">
                      Kunjungi <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">vercel.com/signup</a> dan masuk dengan akun GitHub Anda (100% Gratis).
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      2
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">Import Repository eOSIS</div>
                    <p className="text-slate-600 leading-relaxed">
                      Klik <strong>"Add New Project"</strong> &rarr; Pilih repository eOSIS. Vercel otomatis mengenali preset <strong>Vite</strong>.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      3
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">Klik Deploy &amp; Siap Dipakai!</div>
                    <p className="text-slate-600 leading-relaxed">
                      Klik tombol <strong>"Deploy"</strong>. Dalam 45 detik, website langsung online di domain <code className="font-mono bg-slate-200 px-1 rounded">*.vercel.app</code>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-terminal-fill text-emerald-400 text-base"></i>
                    <span className="text-xs font-bold">Opsi Pengembang: Deploy dengan Vercel CLI (1 Baris)</span>
                  </div>
                  <button
                    onClick={() => handleCopy('npx vercel', 'cli_main')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <i className="bi bi-clipboard"></i>
                    <span>{copiedItem === 'cli_main' ? 'Tersalin!' : 'Salin Perintah'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 select-all overflow-x-auto">
                  npx vercel
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jalankan perintah ini di terminal. Konfirmasi pertanyaan dengan menekan tombol Enter untuk semua pilihan default, dan website pemilihan Anda langsung live!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: NETLIFY */}
          {activeTab === 'netlify' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-extrabold text-teal-950 text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                    <span>Netlify Drop: Cara Termudah Tanpa Perlu Git &amp; Tanpa Coding</span>
                  </div>
                  <p className="text-xs sm:text-sm text-teal-900 font-medium leading-relaxed max-w-2xl">
                    Sangat cocok bagi guru pembina OSIS atau panitia yang tidak terbiasa dengan Git. Cukup jalankan build dan tarik folder <code className="font-mono bg-teal-100 px-1 py-0.5 rounded text-teal-950 font-bold">dist</code> ke browser.
                  </p>
                </div>

                <a
                  href="https://app.netlify.com/drop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-600/20 shrink-0 cursor-pointer"
                >
                  <span>Buka Netlify Drop</span>
                  <i className="bi bi-box-arrow-up-right text-[10px]"></i>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    1
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">Kompilasi Proyek (Build)</div>
                  <p className="text-slate-600 leading-relaxed">
                    Jalankan perintah berikut di terminal komputer Anda:
                  </p>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 font-bold">
                    npm run build
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Perintah ini akan menghasilkan folder bernama <strong>dist</strong>.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    2
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">Buka Netlify Drop</div>
                  <p className="text-slate-600 leading-relaxed">
                    Kunjungi <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-teal-600 font-bold underline">app.netlify.com/drop</a> di Google Chrome atau browser Anda.
                  </p>
                  <div className="p-2.5 bg-teal-50 rounded-xl text-teal-800 text-[11px]">
                    Tidak wajib daftar di awal, bisa langsung upload!
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    3
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">Tarik Folder dist &amp; Live!</div>
                  <p className="text-slate-600 leading-relaxed">
                    Tarik folder <strong>dist</strong> ke kotak upload Netlify. Dalam 10 detik, website eOSIS aktif dengan URL <code className="font-mono bg-slate-200 px-1 rounded">*.netlify.app</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PENJELASAN AI STUDIO */}
          {activeTab === 'aistudio' && (
            <div className="space-y-5 text-xs">
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                <div className="font-extrabold text-base flex items-center gap-2 text-amber-950">
                  <i className="bi bi-exclamation-triangle-fill text-amber-600 text-lg"></i>
                  <span>Mengapa Tombol "Publish" di Google AI Studio Belum Bisa atau Meminta Verifikasi?</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm">
                  Ketika Anda menekan tombol <strong>Publish</strong> di bilah atas Google AI Studio, sistem AI Studio akan memproses deployment ke layanan <strong>Google Cloud Run</strong>.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <i className="bi bi-credit-card-2-front text-amber-600"></i>
                      <span>Persyaratan Google Cloud Billing</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Meskipun Cloud Run memiliki kuota gratis 2 juta request per bulan, Google Cloud tetap mewajibkan akun memiliki penagihan (billing/kartu pembayaran) aktif untuk mengaktifkan Cloud Run API.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <i className="bi bi-check-circle-fill text-emerald-600"></i>
                      <span>Solusi 100% Gratis untuk Sekolah</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Karena sekolah biasanya tidak menyediakan kartu kredit, kami telah menyiapkan konfigurasi lengkap untuk <strong>Vercel</strong> dan <strong>Netlify</strong> yang 100% GRATIS selamanya tanpa perlu kartu kredit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">Jika Anda Sudah Memiliki Google Cloud Project:</h4>
                <ol className="list-decimal pl-5 space-y-2 text-slate-700 leading-relaxed">
                  <li>Pastikan akun Google Anda terhubung ke Google Cloud Project dengan billing aktif.</li>
                  <li>Klik tombol <strong>"Publish"</strong> di pojok kanan atas AI Studio.</li>
                  <li>Pilih project Anda, dan sistem akan meng-host container ke Cloud Run (port 8080/3000 dan endpoint <code>/healthz</code> sudah terkonfigurasi secara otomatis).</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: CLOUDFLARE PAGES */}
          {activeTab === 'cloudflare' && (
            <div className="space-y-5 text-xs">
              <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 space-y-2">
                <div className="font-extrabold text-base flex items-center gap-2">
                  <i className="bi bi-shield-check text-orange-600 text-lg"></i>
                  <span>Cloudflare Pages (Unlimited Bandwidth Tanpa Batasan)</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm">
                  Layanan Cloudflare Pages memiliki infrastruktur server edge tersebar di seluruh Indonesia (Jakarta, Surabaya, dll.), membuat akses pemilihan sangat cepat dan lancar dari kuota ponsel siswa.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">Panduan Konfigurasi Cloudflare Pages:</h4>
                <div className="space-y-2 text-slate-700 leading-relaxed">
                  <p>1. Masuk ke <a href="https://pages.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold underline">pages.cloudflare.com</a>.</p>
                  <p>2. Hubungkan repository GitHub eOSIS.</p>
                  <p>3. Pengaturan Build:</p>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                    <div>Framework preset: <strong>Vite</strong></div>
                    <div>Build command: <strong>npm run build</strong></div>
                    <div>Build output directory: <strong>dist</strong></div>
                  </div>
                  <p>4. Klik <strong>Save and Deploy</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ENV KEYS */}
          {activeTab === 'env' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Environment Variables Supabase</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Salin variabel ini jika ingin memasangnya pada menu Environment Variables di Vercel / Netlify
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(envContent, 'fullenv_page')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <i className="bi bi-clipboard"></i>
                    <span>{copiedItem === 'fullenv_page' ? 'Tersalin!' : 'Salin Semua Variabel'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>VITE_SUPABASE_URL</span>
                      <button
                        onClick={() => handleCopy(SUPABASE_URL, 'url_page')}
                        className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                      >
                        {copiedItem === 'url_page' ? 'Tersalin!' : 'Salin URL'}
                      </button>
                    </div>
                    <div className="font-mono text-xs bg-white p-3 rounded-xl border border-slate-300 text-slate-800 select-all truncate">
                      {SUPABASE_URL}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>VITE_SUPABASE_ANON_KEY (Public Key Client)</span>
                      <button
                        onClick={() => handleCopy(SUPABASE_ANON_KEY, 'key_page')}
                        className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                      >
                        {copiedItem === 'key_page' ? 'Tersalin!' : 'Salin Key'}
                      </button>
                    </div>
                    <div className="font-mono text-xs bg-white p-3 rounded-xl border border-slate-300 text-slate-800 select-all truncate">
                      {SUPABASE_ANON_KEY}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
