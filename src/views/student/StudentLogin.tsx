import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import { formatDateIndonesian, normalizeDateToYMD } from '../../lib/dateUtils';

interface StudentLoginProps {
  onGoToAdmin: () => void;
  onOpenSqlModal: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onGoToAdmin, onOpenSqlModal }) => {
  const { settings, loginStudent, isDatabaseLive } = useElection();
  const [nisn, setNisn] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [dateInputMode, setDateInputMode] = useState<'picker' | 'text'>('picker');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await loginStudent(nisn, birthDate);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat memproses login. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 via-slate-50 to-indigo-50/30">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 mb-1">
            <i className="bi bi-person-check-fill text-3xl"></i>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bilik Suara Siswa
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Pemilihan Ketua & Wakil Ketua OSIS <br />
            <span className="font-semibold text-blue-700">{settings.school_name}</span>
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-semibold">
            <i className="bi bi-calendar3"></i>
            {settings.election_period}
          </div>
        </div>

        {/* Voting Status Alert if closed */}
        {!settings.is_voting_open && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <i className="bi bi-lock-fill text-xl text-rose-600"></i>
            <div>
              <span className="font-bold">Pemilihan Ditutup:</span> Saat ini panitia pemilihan sedang menutup akses pemungutan suara.
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                <i className="bi bi-exclamation-circle-fill text-rose-500 text-base shrink-0 mt-0.5"></i>
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <div>
              <label htmlFor="nisn" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="bi bi-person-vcard text-lg"></i>
                </div>
                <input
                  id="nisn"
                  type="text"
                  required
                  placeholder="Contoh: 0071234561"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 placeholder-slate-400 transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Masukkan 10 digit NISN resmi Anda yang terdaftar di Dapodik.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="birth_date" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tanggal Lahir
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDateInputMode('picker')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      dateInputMode === 'picker'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <i className="bi bi-calendar3 mr-1"></i>
                    Kalender
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setDateInputMode('text')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      dateInputMode === 'text'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <i className="bi bi-keyboard mr-1"></i>
                    Ketik Tgl
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="bi bi-calendar-event text-lg"></i>
                </div>
                {dateInputMode === 'picker' ? (
                  <input
                    id="birth_date"
                    type="date"
                    required
                    value={normalizeDateToYMD(birthDate)}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 transition-all font-mono"
                  />
                ) : (
                  <input
                    id="birth_date"
                    type="text"
                    required
                    placeholder="Contoh: 14/05/2009 atau 2009-05-14"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 transition-all font-mono"
                  />
                )}
              </div>

              {/* Live Indonesian Date Confirmation Preview */}
              {birthDate && normalizeDateToYMD(birthDate) && (
                <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold animate-in fade-in">
                  <i className="bi bi-calendar-check-fill text-emerald-600 text-xs"></i>
                  <span>Tanggal Terbaca: <strong>{formatDateIndonesian(birthDate)}</strong> <span className="font-mono text-emerald-600">({normalizeDateToYMD(birthDate)})</span></span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan format sesuai sheet: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">YYYY-MM-DD</code> atau <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">DD/MM/YYYY</code>.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !settings.is_voting_open}
              className={`w-full py-3.5 px-4 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                !settings.is_voting_open
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : isSubmitting
                  ? 'bg-blue-400 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-500/25'
              }`}
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin text-lg"></i>
                  <span>Memeriksa Hak Suara...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right text-lg"></i>
                  <span>Masuk ke Bilik Suara</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <button
            onClick={onOpenSqlModal}
            className="hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <i className={`bi ${isDatabaseLive ? 'bi-database-check text-emerald-600' : 'bi-database text-amber-500'}`}></i>
            <span>Status Supabase</span>
          </button>

          <button
            onClick={onGoToAdmin}
            className="hover:text-blue-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <i className="bi bi-shield-lock"></i>
            <span>Login Administrator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
