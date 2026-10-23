import React from 'react';
import { useElection } from '../../context/ElectionContext';

interface AdminDashboardProps {
  onOpenSqlModal: () => void;
  onOpenPublishModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenSqlModal, onOpenPublishModal }) => {
  const { 
    settings, 
    classes, 
    students, 
    candidates, 
    setAdminActiveTab, 
    updateSettings, 
    isDatabaseLive 
  } = useElection();

  const totalStudents = students.length;
  const votedStudents = students.filter(s => s.has_voted).length;
  const unvotedStudents = totalStudents - votedStudents;
  const participationPercentage = totalStudents > 0 ? ((votedStudents / totalStudents) * 100).toFixed(1) : '0';
  const totalClasses = classes.length;
  const totalCandidates = candidates.length;
  const totalVotesCast = candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);

  const toggleVotingOpen = async () => {
    await updateSettings({ is_voting_open: !settings.is_voting_open });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Dashboard Eksekutif
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {settings.election_period}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Beranda eOSIS
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
            Pusat kendali dan rekapitulasi pemilihan OSIS di <span className="text-white font-bold">{settings.school_name}</span>. Pantau partisipasi pemilih secara langsung.
          </p>
        </div>

        {/* Voting Status Control */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 flex flex-col gap-2 shrink-0 sm:min-w-[220px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Status Pemilihan:</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                settings.is_voting_open
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${settings.is_voting_open ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              {settings.is_voting_open ? 'Sedang Dibuka' : 'Ditutup'}
            </span>
          </div>

          <button
            onClick={toggleVotingOpen}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              settings.is_voting_open
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            <i className={`bi ${settings.is_voting_open ? 'bi-lock-fill' : 'bi-unlock-fill'}`}></i>
            <span>{settings.is_voting_open ? 'Tutup Pemilihan' : 'Buka Pemilihan'}</span>
          </button>
        </div>
      </div>

      {/* Supabase Notice if not live */}
      {!isDatabaseLive && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <i className="bi bi-info-circle-fill text-amber-600 text-lg shrink-0"></i>
            <div>
              <span className="font-bold">Info Integrasi Database:</span> Database Supabase belum memiliki tabel. Aplikasi saat ini menggunakan penyimpanan lokal.
            </div>
          </div>
          <button
            onClick={onOpenSqlModal}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <i className="bi bi-code-square"></i>
            <span>Buka Skrip SQL Supabase</span>
          </button>
        </div>
      )}

      {/* 6 Key Statistics Required by Prompt */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Total Siswa */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Siswa</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="bi bi-people-fill text-base"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{totalStudents}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Daftar Pemilih Tetap</div>
          </div>
        </div>

        {/* 2. Total Kelas */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Kelas</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <i className="bi bi-building text-base"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{totalClasses}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Rombongan Belajar</div>
          </div>
        </div>

        {/* 3. Total Kandidat */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kandidat</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <i className="bi bi-person-badge-fill text-base"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{totalCandidates}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Pasangan Calon</div>
          </div>
        </div>

        {/* 4. Sudah Memilih */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 bg-emerald-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Sudah Memilih</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <i className="bi bi-check-circle-fill text-base"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">{votedStudents}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Suara Terverifikasi</div>
          </div>
        </div>

        {/* 5. Belum Memilih */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 bg-amber-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Belum Memilih</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <i className="bi bi-hourglass-split text-base"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">{unvotedStudents}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">Menunggu Hak Suara</div>
          </div>
        </div>

        {/* 6. Persentase Partisipasi */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-200 bg-blue-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Partisipasi</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <i className="bi bi-pie-chart-fill text-base"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">{participationPercentage}%</div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">Tingkat Kehadiran</div>
          </div>
        </div>
      </div>

      {/* Progress Bar Partisipasi */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Tingkat Partisipasi Pemilih DPT</h3>
            <p className="text-xs text-slate-500 font-medium">
              Perbandingan suara masuk ({votedStudents}) terhadap total hak suara ({totalStudents})
            </p>
          </div>
          <div className="text-right">
            <span className="font-black text-blue-600 text-xl font-mono">{participationPercentage}%</span>
            <span className="text-xs text-slate-400 ml-1">tercapai</span>
          </div>
        </div>

        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, Number(participationPercentage)))}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            Sudah Memilih: <strong>{votedStudents} siswa</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            Belum Memilih: <strong>{unvotedStudents} siswa</strong>
          </span>
        </div>
      </div>

      {/* Quick Count Snapshot & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates Live Standings */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <i className="bi bi-bar-chart-fill"></i>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Rekapitulasi Suara Sementara</h3>
            </div>
            <button
              onClick={() => setAdminActiveTab('perolehan-suara')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              Lihat Grafik Lengkap <i className="bi bi-arrow-right"></i>
            </button>
          </div>

          <div className="space-y-4">
            {candidates.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <i className="bi bi-person-badge text-3xl text-slate-300 block"></i>
                <p className="text-xs font-medium text-slate-600">Belum ada calon kandidat yang didaftarkan.</p>
                <button
                  type="button"
                  onClick={() => setAdminActiveTab('kandidat')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  + Tambah Paslon Kandidat
                </button>
              </div>
            ) : (
              candidates.map((cand) => {
                const candVote = cand.vote_count || 0;
                const percent = totalVotesCast > 0 ? ((candVote / totalVotesCast) * 100).toFixed(1) : '0';
                return (
                  <div key={cand.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                          0{cand.candidate_number}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {cand.chairman_name} &amp; {cand.vice_chairman_name}
                          </div>
                          <div className="text-[11px] text-slate-500 italic truncate max-w-xs sm:max-w-md">
                            {cand.slogan || 'Paslon Calon Ketua & Wakil OSIS'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-slate-900 text-base">{candVote} Suara</div>
                        <div className="text-xs text-blue-600 font-bold">{percent}%</div>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Menu Shortcuts */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">Aksi Cepat Menu</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Navigasi pintas manajemen pemilihan</p>

            <div className="space-y-2.5">
              <button
                onClick={() => setAdminActiveTab('siswa')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <i className="bi bi-person-plus-fill text-blue-600 text-base"></i>
                  <span>Kelola &amp; Tambah Siswa (DPT)</span>
                </div>
                <i className="bi bi-chevron-right text-slate-400"></i>
              </button>

              <button
                onClick={() => setAdminActiveTab('kelas')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <i className="bi bi-building-add text-indigo-600 text-base"></i>
                  <span>Kelola Kelas &amp; Rombel</span>
                </div>
                <i className="bi bi-chevron-right text-slate-400"></i>
              </button>

              <button
                onClick={() => setAdminActiveTab('kandidat')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <i className="bi bi-person-badge-fill text-violet-600 text-base"></i>
                  <span>Kelola Calon Kandidat OSIS</span>
                </div>
                <i className="bi bi-chevron-right text-slate-400"></i>
              </button>

              <button
                onClick={() => setAdminActiveTab('pengaturan')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <i className="bi bi-gear-fill text-slate-600 text-base"></i>
                  <span>Pengaturan Sekolah &amp; Akun</span>
                </div>
                <i className="bi bi-chevron-right text-slate-400"></i>
              </button>

            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-center gap-2.5">
            <i className="bi bi-shield-check text-xl text-blue-600 shrink-0"></i>
            <div>
              <strong>Azas Rahasia:</strong> Sistem menjaga kerahasiaan pilihan siswa secara mutlak sesuai aturan pemilihan demokratis.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
