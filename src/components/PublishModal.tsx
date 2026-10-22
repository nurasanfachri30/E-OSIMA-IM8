import React, { useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { useElection } from '../context/ElectionContext';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const { isDatabaseLive, settings } = useElection();
  const [activeTab, setActiveTab] = useState<'vercel' | 'netlify' | 'aistudio' | 'env' | 'cloudflare'>('vercel');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/25 shrink-0">
                <i className="bi bi-rocket-takeoff-fill"></i>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    100% Free Tier Selamanya
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Rp 0 / Tanpa Biaya Server</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Pusat Publish &amp; Hosting Online Gratis
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
                  Publikasikan eOSIS ke internet agar seluruh siswa &amp; guru dapat memilih langsung dari HP masing-masing
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Tutup"
            >
              <i className="bi bi-x-lg text-lg"></i>
            </button>
          </div>

          {/* Pre-Flight Health Audit Pills */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
              <i className="bi bi-check-circle-fill text-emerald-400"></i>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Bundle Vite</div>
                <div className="font-bold text-white text-[11px]">Siap Dikompilasi</div>
              </div>
            </div>

            <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
              <i className={`bi ${isDatabaseLive ? 'bi-database-check text-emerald-400' : 'bi-database-exclamation text-amber-400'}`}></i>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Supabase Cloud</div>
                <div className="font-bold text-white text-[11px] truncate">
                  {isDatabaseLive ? 'Online & Terhubung' : 'Lokal (Siap SQL)'}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
              <i className="bi bi-filetype-json text-blue-400"></i>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Vercel Config</div>
                <div className="font-bold text-emerald-300 text-[11px]">vercel.json Aktif</div>
              </div>
            </div>

            <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
              <i className="bi bi-shield-lock-fill text-indigo-400"></i>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Keamanan Suara</div>
                <div className="font-bold text-white text-[11px]">Enkripsi SHA-256</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto shrink-0 py-2">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'vercel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <i className="bi bi-triangle-fill text-[11px]"></i>
            <span>Vercel (Paling Direkomendasikan)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-extrabold uppercase">
              2 Menit
            </span>
          </button>

          <button
            onClick={() => setActiveTab('netlify')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'netlify'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <i className="bi bi-cloud-arrow-up-fill text-xs"></i>
            <span>Netlify (Bisa Drag &amp; Drop)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-extrabold uppercase">
              Tanpa Git
            </span>
          </button>

          <button
            onClick={() => setActiveTab('aistudio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'aistudio'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <i className="bi bi-question-circle-fill text-xs text-amber-500"></i>
            <span>Kendala "Publish" AI Studio?</span>
          </button>

          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'env'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <i className="bi bi-key-fill text-xs"></i>
            <span>Salin Kunci Env Supabase</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: VERCEL */}
          {activeTab === 'vercel' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Mengapa Vercel Adalah Pilihan Terbaik untuk Pemilihan OSIS?</span>
                  </div>
                  <p className="text-xs text-blue-800 font-medium">
                    100% Gratis selamanya, kuota 100 GB/bulan (lebih dari cukup untuk 10.000+ siswa), gratis HTTPS, dan file <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-900">vercel.json</code> sudah kami sediakan di dalam aplikasi.
                  </p>
                </div>

                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <span>Buka Vercel Dashboard</span>
                  <i className="bi bi-box-arrow-up-right text-[10px]"></i>
                </a>
              </div>

              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center">1</span>
                  <span>Cara Mudah: Deploy via GitHub &amp; Vercel Web</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">A</span>
                      <span>Daftar / Login Vercel</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Buka <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">vercel.com</a> dan masuk menggunakan akun GitHub atau Google Anda (Gratis).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">B</span>
                      <span>Import Repository</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Klik <strong>"Add New Project"</strong> &rarr; Pilih repository eOSIS ini. Vercel otomatis mendeteksi framework <strong>Vite</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">C</span>
                      <span>Klik Deploy</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Klik tombol <strong>"Deploy"</strong>. Dalam 40-60 detik aplikasi sudah aktif di domain <code className="font-mono bg-slate-200 px-1 rounded">*.vercel.app</code>!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-terminal-fill text-emerald-400 text-base"></i>
                    <span className="text-xs font-bold">Opsi Cepat: Deploy Menggunakan Terminal / CLI</span>
                  </div>
                  <button
                    onClick={() => handleCopy('npx vercel', 'cli')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <i className="bi bi-clipboard"></i>
                    <span>{copiedItem === 'cli' ? 'Tersalin!' : 'Salin Perintah'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 select-all overflow-x-auto">
                  npx vercel
                </div>
                <p className="text-[11px] text-slate-400">
                  Cukup ketik perintah di atas di folder proyek. Ikuti instruksi di layar, tekan Enter untuk semua default, dan website langsung terpublikasi.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: NETLIFY */}
          {activeTab === 'netlify' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-extrabold text-teal-950 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                    <span>Netlify Drop: Publikasi Tanpa Perlu Akun GitHub / Coding</span>
                  </div>
                  <p className="text-xs text-teal-800 font-medium">
                    Sangat praktis untuk guru atau pembina OSIS. Cukup drag-and-drop folder <code className="font-mono bg-teal-100 px-1 py-0.5 rounded text-teal-900">dist</code> ke halaman Netlify!
                  </p>
                </div>

                <a
                  href="https://app.netlify.com/drop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <span>Buka Netlify Drop</span>
                  <i className="bi bi-box-arrow-up-right text-[10px]"></i>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Jalankan Build</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Jalankan <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">npm run build</code> di komputer Anda untuk menghasilkan folder <strong>dist</strong> yang siap pakai.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Drag &amp; Drop Folder</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Buka <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-teal-600 font-bold underline">app.netlify.com/drop</a> di browser, lalu tarik folder <strong>dist</strong> ke kotak yang tersedia.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Website Siap Diakses!</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Netlify langsung memberikan URL HTTPS gratis (contoh: <code className="font-mono bg-slate-200 px-1 rounded">eosis-smp1.netlify.app</code>). File <code className="font-mono bg-slate-200 px-1 rounded">_redirects</code> sudah otomatis aktif!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PENJELASAN PUBLISH AI STUDIO */}
          {activeTab === 'aistudio' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="font-extrabold text-sm flex items-center gap-2 text-amber-950">
                  <i className="bi bi-exclamation-triangle-fill text-amber-600 text-base"></i>
                  <span>Mengapa Tombol "Publish" di Google AI Studio Belum Berfungsi / Meminta Verifikasi?</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Fitur <strong>Publish</strong> internal Google AI Studio mengunggah aplikasi langsung ke <strong>Google Cloud Run</strong>.
                </p>
                <div className="space-y-1.5 pl-4 border-l-2 border-amber-300 text-slate-700 mt-2">
                  <p>
                    <strong>1. Memerlukan Akun Google Cloud dengan Billing:</strong> Walaupun Cloud Run memiliki kuota gratis (2 juta eksekusi per bulan), sistem Google Cloud tetap mensyaratkan verifikasi kartu pembayaran / billing account aktif untuk membuka API Cloud Run.
                  </p>
                  <p>
                    <strong>2. Bebas Biaya untuk Sekolah:</strong> Karena sebagian besar sekolah dan panitia OSIS tidak memiliki kartu kredit untuk Google Cloud, <strong>solusi terbaik dan resmi adalah menggunakan hosting Free Tier (Vercel atau Netlify)</strong>.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Rekomendasi Langkah untuk Panitia Pemilihan:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <p className="text-slate-600">
                      Gunakan <strong>Vercel</strong> atau <strong>Netlify</strong> (tersedia di tab sebelah). Keduanya 100% GRATIS, tidak membutuhkan kartu kredit, dan langsung online dalam hitungan menit.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <p className="text-slate-600">
                      Seluruh data siswa, foto kandidat, dan hasil suara tetap tersimpan aman di <strong>Supabase Cloud</strong> yang terhubung ke aplikasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLOUDFLARE PAGES */}
          {activeTab === 'cloudflare' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 space-y-2">
                <div className="font-extrabold text-sm flex items-center gap-2">
                  <i className="bi bi-shield-check text-orange-600 text-base"></i>
                  <span>Cloudflare Pages (Gratis Selamanya Tanpa Batas Bandwidth)</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Cloudflare memiliki ratusan server edge termasuk di Jakarta, sehingga sangat cepat diakses dari jaringan provider seluler mana pun di Indonesia (Telkomsel, Indosat, XL, Tri, Axis).
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Langkah Deploy ke Cloudflare Pages:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
                  <li>Buka <a href="https://pages.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold underline">pages.cloudflare.com</a> dan buat akun gratis.</li>
                  <li>Pilih <strong>"Connect to Git"</strong> dan pilih repo eOSIS.</li>
                  <li>Atur <strong>Framework preset</strong> ke <strong>Vite</strong>.</li>
                  <li>Build command: <code className="bg-slate-200 px-1 rounded font-mono">npm run build</code> | Output: <code className="bg-slate-200 px-1 rounded font-mono">dist</code></li>
                  <li>Klik <strong>"Save and Deploy"</strong>. Selesai!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 5: SALIN KUNCI ENV */}
          {activeTab === 'env' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Environment Variables Supabase</h4>
                    <p className="text-xs text-slate-500">
                      Sebenarnya kode sudah memiliki nilai cadangan bawaan, namun Anda dapat menempelkan variabel ini di dashboard Vercel / Netlify.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(envContent, 'fullenv')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <i className="bi bi-clipboard"></i>
                    <span>{copiedItem === 'fullenv' ? 'Tersalin!' : 'Salin Semua'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>VITE_SUPABASE_URL</span>
                      <button
                        onClick={() => handleCopy(SUPABASE_URL, 'url')}
                        className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                      >
                        {copiedItem === 'url' ? 'Tersalin!' : 'Salin Nilai'}
                      </button>
                    </div>
                    <div className="font-mono text-xs bg-white p-2.5 rounded-xl border border-slate-300 text-slate-800 select-all truncate">
                      {SUPABASE_URL}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>VITE_SUPABASE_ANON_KEY (Public Key)</span>
                      <button
                        onClick={() => handleCopy(SUPABASE_ANON_KEY, 'key')}
                        className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                      >
                        {copiedItem === 'key' ? 'Tersalin!' : 'Salin Nilai'}
                      </button>
                    </div>
                    <div className="font-mono text-xs bg-white p-2.5 rounded-xl border border-slate-300 text-slate-800 select-all truncate">
                      {SUPABASE_ANON_KEY}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            <span>Panduan lengkap juga tersedia di file </span>
            <code className="font-mono font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">DEPLOY.md</code>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                const element = document.createElement('a');
                const file = new Blob([
                  `# PANDUAN PUBLISH eOSIS FREE TIER\n\nLihat file DEPLOY.md di proyek Anda atau kunjungi https://vercel.com/new untuk deploy gratis 100%.\n\nSupabase URL: ${SUPABASE_URL}\nSupabase Key: ${SUPABASE_ANON_KEY}`
                ], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = 'PANDUAN_PUBLISH_EOSIS.txt';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <i className="bi bi-download"></i>
              <span>Unduh Catatan Teks</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
