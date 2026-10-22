import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';

interface AdminLoginProps {
  onBackToStudent: () => void;
  onOpenSqlModal: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStudent, onOpenSqlModal }) => {
  const { settings, loginAdmin, isDatabaseLive } = useElection();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await loginAdmin(username, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat memproses login admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-1">
            <i className="bi bi-shield-lock-fill text-3xl"></i>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panel Administrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Sistem Manajemen &amp; Rekapitulasi <br />
            <span className="text-blue-400 font-semibold">{settings.school_name}</span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-700/80 p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <i className="bi bi-exclamation-circle-fill text-rose-400 text-base shrink-0 mt-0.5"></i>
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Username Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="bi bi-person-fill text-lg"></i>
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Masukkan username admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-white placeholder-slate-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="bi bi-key-fill text-lg"></i>
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-white placeholder-slate-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  <span>Mengautentikasi...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right text-lg"></i>
                  <span>Masuk Panel Admin</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <button
            onClick={onOpenSqlModal}
            className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <i className={`bi ${isDatabaseLive ? 'bi-database-check text-emerald-400' : 'bi-database text-amber-400'}`}></i>
            <span>Supabase Config</span>
          </button>

          <button
            onClick={onBackToStudent}
            className="hover:text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Kembali ke Bilik Suara Siswa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
