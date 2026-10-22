import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import { VotingBooth } from './VotingBooth';

export const StudentDashboard: React.FC = () => {
  const { currentStudent, logoutStudent, settings } = useElection();
  const [inVotingBooth, setInVotingBooth] = useState(false);

  if (!currentStudent) return null;

  if (inVotingBooth && !currentStudent.has_voted) {
    return <VotingBooth onBackToDashboard={() => setInVotingBooth(false)} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-blue-100 border border-white/20">
              Portal Pemilih eOSIS • {settings.election_period}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Halo, {currentStudent.name}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Selamat datang di sistem pemilihan OSIS resmi {settings.school_name}.
            </p>
          </div>

          <button
            onClick={logoutStudent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer shrink-0"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Biodata & Voting Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Biodata Siswa */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                <i className="bi bi-person-lines-fill"></i>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Biodata Pemilih</h2>
                <p className="text-xs text-slate-500 font-medium">Terverifikasi pada Daftar Pemilih Tetap (DPT)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Nama Lengkap Siswa
              </span>
              <p className="font-extrabold text-slate-800 text-sm">{currentStudent.name}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                NISN (Nomor Induk Siswa Nasional)
              </span>
              <p className="font-mono font-bold text-slate-800 text-sm">{currentStudent.nisn}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Kelas
              </span>
              <p className="font-extrabold text-blue-700 text-sm">{currentStudent.class_name}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Tanggal Lahir
              </span>
              <p className="font-semibold text-slate-800 text-sm font-mono">{currentStudent.birth_date}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Jenis Kelamin
              </span>
              <p className="font-semibold text-slate-800 text-sm">{currentStudent.gender || 'Laki-laki'}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-3">
            <i className="bi bi-shield-check text-xl text-blue-600 shrink-0"></i>
            <div className="leading-relaxed">
              <strong>Asas Kerahasiaan (LUBER JURDIL):</strong> Pilihan Anda dilindungi oleh enkripsi sistem eOSIS. Panitia dan administrator sekolah tidak dapat mengetahui nama kandidat yang Anda pilih.
            </div>
          </div>
        </div>

        {/* Right Column: Status Hak Suara & Action */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status Hak Suara
            </div>

            {currentStudent.has_voted ? (
              /* Sudah Memilih */
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div>
                  <h3 className="font-black text-emerald-900 text-base leading-tight">
                    Anda sudah menggunakan hak suara
                  </h3>
                  <p className="text-xs text-emerald-700 mt-1 font-medium leading-relaxed">
                    Terima kasih atas partisipasi aktif Anda dalam pesta demokrasi pemilihan ketua dan wakil ketua OSIS.
                  </p>
                </div>
                {currentStudent.voted_at && (
                  <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800 font-mono">
                    Waktu Memilih: {new Date(currentStudent.voted_at).toLocaleString('id-ID')}
                  </div>
                )}
              </div>
            ) : (
              /* Belum Memilih */
              <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-2xl shadow-sm animate-bounce">
                  <i className="bi bi-envelope-paper-heart-fill"></i>
                </div>
                <div>
                  <h3 className="font-black text-blue-950 text-base leading-tight">
                    Hak Suara Tersedia
                  </h3>
                  <p className="text-xs text-blue-700 mt-1 font-medium leading-relaxed">
                    Status Anda tercatat sebagai pemilih aktif dan belum memberikan suara.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Button: ONLY show 'Berikan Suara' if haven't voted! */}
          <div>
            {!currentStudent.has_voted ? (
              <button
                type="button"
                onClick={() => setInVotingBooth(true)}
                disabled={!settings.is_voting_open}
                className={`w-full py-4 px-4 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                  !settings.is_voting_open
                    ? 'bg-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] shadow-blue-500/30'
                }`}
              >
                <i className="bi bi-pencil-square text-lg"></i>
                <span>Berikan Suara</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                <i className="bi bi-lock-fill text-slate-400 text-lg block mb-1"></i>
                Tombol bilik suara dinonaktifkan karena hak suara telah digunakan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
