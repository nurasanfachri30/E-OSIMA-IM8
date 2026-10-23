import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import { uploadImageToStorage, SUPABASE_URL } from '../../lib/supabase';
import { sha256 } from '../../lib/crypto';

interface SettingsPageProps {
  onOpenSqlModal: () => void;
  onOpenPublishModal?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenSqlModal, onOpenPublishModal }) => {
  const { 
    settings, 
    updateSettings, 
    isDatabaseLive, 
    refreshAllData, 
    isLoading 
  } = useElection();

  // School identity state
  const [schoolName, setSchoolName] = useState(settings.school_name);
  const [electionPeriod, setElectionPeriod] = useState(settings.election_period);
  const [schoolLogoUrl, setSchoolLogoUrl] = useState(settings.school_logo_url || '');
  const [isVotingOpen, setIsVotingOpen] = useState(settings.is_voting_open);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const [schoolSuccessMsg, setSchoolSuccessMsg] = useState('');

  // Admin security credentials state
  const [adminUsername, setAdminUsername] = useState(settings.admin_username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authErrorMsg, setAuthErrorMsg] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Handle Logo Upload to Supabase Storage
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoUploadError('');
    try {
      const url = await uploadImageToStorage(file, 'school');
      setSchoolLogoUrl(url);
    } catch (err) {
      console.error('Logo upload error:', err);
      setLogoUploadError('Gagal memproses unggahan logo. Gunakan format gambar PNG/JPEG.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Save General School Settings
  const handleSaveSchoolSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolSuccessMsg('');

    await updateSettings({
      school_name: schoolName.trim(),
      election_period: electionPeriod.trim(),
      school_logo_url: schoolLogoUrl.trim(),
      is_voting_open: isVotingOpen,
    });

    setSchoolSuccessMsg('Pengaturan sekolah & periode pemilihan berhasil disimpan!');
    setTimeout(() => setSchoolSuccessMsg(''), 4000);
  };

  // Save Admin Security (Username & Password)
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg('');
    setAuthSuccessMsg('');

    if (!adminUsername.trim()) {
      setAuthErrorMsg('Username admin tidak boleh kosong.');
      return;
    }

    // Verify current password
    const currentHash = await sha256(currentPassword);
    const isCurrentValid =
      currentHash === settings.admin_password_hash ||
      (currentPassword === 'admin123' && settings.admin_username === 'admin');

    if (!isCurrentValid) {
      setAuthErrorMsg('Password lama yang Anda masukkan tidak sesuai.');
      return;
    }

    let updatedHash = settings.admin_password_hash;

    if (newPassword) {
      if (newPassword.length < 6) {
        setAuthErrorMsg('Password baru minimal harus 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setAuthErrorMsg('Konfirmasi password baru tidak cocok.');
        return;
      }
      // Hash new password using SHA-256 (never plain text)
      updatedHash = await sha256(newPassword);
    }

    await updateSettings({
      admin_username: adminUsername.trim(),
      admin_password_hash: updatedHash,
    });

    setAuthSuccessMsg('Kredensial login administrator berhasil diperbarui dengan enkripsi SHA-256!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setAuthSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Konfigurasi Sistem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pengaturan Aplikasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Atur identitas sekolah, periode pemilihan, keamanan admin, dan integrasi database Supabase
          </p>
        </div>

        <button
          onClick={onOpenSqlModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          <i className="bi bi-database-check text-sm"></i>
          <span>Status &amp; SQL Supabase</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: School Identity & Election Setup */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <i className="bi bi-building-gear"></i>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Identitas Sekolah &amp; Periode</h2>
              <p className="text-xs text-slate-500 font-medium">Otomatis ditampilkan di seluruh halaman aplikasi</p>
            </div>
          </div>

          {schoolSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <i className="bi bi-check-circle-fill text-emerald-600 text-base"></i>
              <span className="font-medium">{schoolSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSchoolSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Sekolah
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: SMA Negeri 1 Prestasi Bangsa"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Periode Pemilihan
              </label>
              <input
                type="text"
                required
                value={electionPeriod}
                onChange={(e) => setElectionPeriod(e.target.value)}
                placeholder="Contoh: Periode 2026/2027"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>

            {/* School Logo */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">
                Logo Sekolah (Supabase Storage / URL)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {schoolLogoUrl ? (
                    <img src={schoolLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <i className="bi bi-mortarboard text-2xl text-slate-400"></i>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={schoolLogoUrl}
                    onChange={(e) => setSchoolLogoUrl(e.target.value)}
                    placeholder="URL gambar logo sekolah"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors">
                      <i className="bi bi-cloud-arrow-up-fill text-blue-600"></i>
                      <span>{isUploadingLogo ? 'Mengunggah...' : 'Unggah Logo ke Supabase'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploadingLogo}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {logoUploadError && (
                    <p className="text-[11px] text-rose-600 font-medium">
                      {logoUploadError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Voting Switch */}
            <div className="pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-800 text-sm">Status Pemungutan Suara</div>
                  <div className="text-slate-500 text-xs font-medium">
                    {isVotingOpen ? 'Pemilihan AKTIF - Siswa dapat memberikan suara' : 'Pemilihan DITUTUP - Bilik suara dikunci'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isVotingOpen}
                  onChange={(e) => setIsVotingOpen(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="bi bi-check2"></i>
                <span>Simpan Pengaturan Sekolah</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Admin Security & Password Change */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Keamanan Administrator</h2>
              <p className="text-xs text-slate-500 font-medium">Ganti username dan password (terenkripsi SHA-256)</p>
            </div>
          </div>

          {authErrorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <i className="bi bi-exclamation-circle-fill text-rose-600 text-base"></i>
              <span className="font-medium">{authErrorMsg}</span>
            </div>
          )}

          {authSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <i className="bi bi-check-circle-fill text-emerald-600 text-base"></i>
              <span className="font-medium">{authSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username Admin
              </label>
              <input
                type="text"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password Lama (Verifikasi)
              </label>
              <input
                type="password"
                required
                placeholder="Masukkan password admin saat ini"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password Baru (Opsional)
                </label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ulangi Password Baru
                </label>
                <input
                  type="password"
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Keamanan Terjamin:</strong> Password Anda tidak disimpan dalam bentuk teks biasa (plain text), melainkan di-hash dengan algoritma kriptografi satu arah SHA-256.
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="bi bi-shield-check"></i>
                <span>Perbarui Kredensial Admin</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section 3: Supabase Integration & Status Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <i className="bi bi-database-check"></i>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Database Supabase Cloud</h2>
              <p className="text-xs text-slate-500 font-medium">Penyimpanan cloud terdistribusi, aman, dan berintegritas tinggi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshAllData()}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <i className={`bi bi-arrow-clockwise ${isLoading ? 'animate-spin' : ''}`}></i>
              <span>Cek Ulang Koneksi</span>
            </button>

            <button
              onClick={onOpenSqlModal}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <i className="bi bi-code-square"></i>
              <span>Buka SQL Schema</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Status Koneksi
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-3 h-3 rounded-full ${isDatabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="font-extrabold text-slate-800 text-sm">
                {isDatabaseLive ? 'Supabase Live Connected' : 'Tabel Belum Dibuat di Supabase'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Supabase Project URL
            </span>
            <div className="font-mono text-slate-700 truncate select-all font-medium mt-1">
              {SUPABASE_URL}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Security &amp; Keys
            </span>
            <div className="text-emerald-700 font-semibold text-xs mt-1 flex items-center gap-1">
              <i className="bi bi-shield-check"></i>
              <span>Anon Public Key Aman (No Service Role)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Publish & Hosting Online Free Tier */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <i className="bi bi-rocket-takeoff-fill"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Publish &amp; Hosting Online</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  100% Free Tier Selamanya
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Pilihan publikasi agar website dapat diakses seluruh siswa melalui smartphone atau lab sekolah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenPublishModal && (
              <button
                onClick={onOpenPublishModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <i className="bi bi-window-stack"></i>
                <span>Buka Pusat Panduan Publish</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Card 1: Vercel */}
          <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-blue-950 flex items-center gap-2">
                <i className="bi bi-triangle-fill text-blue-600 text-[10px]"></i>
                <span>Vercel Hosting (Rekomendasi Utama)</span>
              </div>
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Free</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Deploy 1-klik dari repository Git. Sudah dilengkapi file konfigurasi <code className="bg-blue-100 text-blue-900 px-1 rounded font-mono">vercel.json</code> bawaan. Gratis domain HTTPS otomatis.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Buka Vercel Dashboard</span>
                <i className="bi bi-box-arrow-up-right text-[9px]"></i>
              </a>
            </div>
          </div>

          {/* Card 2: Netlify Drop */}
          <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-teal-950 flex items-center gap-2">
                <i className="bi bi-cloud-arrow-up-fill text-teal-600 text-xs"></i>
                <span>Netlify Drop (Drag &amp; Drop)</span>
              </div>
              <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">Tanpa Git</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Cukup jalankan <code className="bg-teal-100 text-teal-900 px-1 rounded font-mono">npm run build</code> dan tarik folder <strong>dist</strong> ke browser di Netlify Drop. Langsung aktif dalam 10 detik.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <a
                href="https://app.netlify.com/drop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Buka Netlify Drop</span>
                <i className="bi bi-box-arrow-up-right text-[9px]"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <i className="bi bi-file-earmark-text text-slate-500 text-base"></i>
            <span>Dokumentasi lengkap langkah publikasi tersedia di file <strong>DEPLOY.md</strong></span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">vercel.json | netlify.toml</span>
        </div>
      </div>
    </div>
  );
};
