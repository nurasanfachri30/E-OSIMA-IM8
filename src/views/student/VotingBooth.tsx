import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useElection } from '../../context/ElectionContext';
import { Candidate } from '../../types';

interface VotingBoothProps {
  onBackToDashboard: () => void;
}

export const VotingBooth: React.FC<VotingBoothProps> = ({ onBackToDashboard }) => {
  const { candidates, currentStudent, castVote, logoutStudent, settings } = useElection();
  
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Post-vote countdown state
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [countdown, setCountdown] = useState(4);

  // Countdown timer for automatic logout after voting
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (voteSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (voteSuccess && countdown <= 0) {
      logoutStudent();
    }
    return () => clearTimeout(timer);
  }, [voteSuccess, countdown, logoutStudent]);

  const handleOpenConfirm = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsConfirming(true);
    setErrorMessage('');
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await castVote(selectedCandidate.id);
      if (result.success) {
        setIsConfirming(false);
        setVoteSuccess(true);
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
        });
      } else {
        setErrorMessage(result.message);
        setIsConfirming(false);
      }
    } catch {
      setErrorMessage('Terjadi kendala saat mengirimkan suara. Silakan coba lagi.');
      setIsConfirming(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If vote succeeded, display 4-second confirmation screen
  if (voteSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-emerald-50 via-white to-blue-50">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-emerald-100 text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <i className="bi bi-check-lg text-5xl"></i>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Hak Suara Terverifikasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              Suara Anda berhasil dicatat, terima kasih telah berpartisipasi
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Pilihan Anda telah tersimpan secara anonim dan aman dalam database pemilihan OSIS. Terima kasih telah menggunakan hak suara secara bijak dan demokratis.
            </p>
          </div>

          {/* Countdown timer & progress bar */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Menutup sesi dan kembali ke login...</span>
              <span className="text-blue-600 font-bold font-mono text-sm">{countdown} detik</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(countdown / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={logoutStudent}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Kembali ke Halaman Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-2 transition-colors cursor-pointer"
          >
            <i className="bi bi-arrow-left"></i>
            Kembali ke Biodata
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Surat Suara Digital
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Silakan teliti profil, visi, dan misi seluruh kandidat sebelum menentukan pilihan Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50 border border-blue-200/70 rounded-2xl px-4 py-2 text-right">
            <div className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider">Pemilih Terdaftar</div>
            <div className="text-sm font-bold text-slate-800">{currentStudent?.name}</div>
            <div className="text-[10px] text-slate-500 font-mono">{currentStudent?.class_name} • NISN: {currentStudent?.nisn}</div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <i className="bi bi-exclamation-triangle-fill text-xl text-rose-500"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((cand) => (
          <div
            key={cand.id}
            className="bg-white rounded-3xl overflow-hidden border-2 border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col group"
          >
            {/* Candidate Header & Number */}
            <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pasangan Calon
              </span>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/30">
                0{cand.candidate_number}
              </div>
            </div>

            {/* Photo */}
            <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
              {cand.photo_url ? (
                <img
                  src={cand.photo_url}
                  alt={`Paslon 0${cand.candidate_number}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <i className="bi bi-people-fill text-6xl"></i>
                  <span className="text-xs text-slate-400 mt-2 font-medium">Foto Paslon</span>
                </div>
              )}
              {cand.slogan && (
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent text-white text-xs italic font-medium">
                  &ldquo;{cand.slogan}&rdquo;
                </div>
              )}
            </div>

            {/* Candidate Names & Info */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    Calon Ketua OSIS
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {cand.chairman_name}
                  </h3>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    Calon Wakil Ketua OSIS
                  </div>
                  <h4 className="text-base font-bold text-slate-800 leading-tight">
                    {cand.vice_chairman_name}
                  </h4>
                </div>

                {/* Brief vision */}
                <div className="pt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  <strong className="text-slate-800">Visi: </strong>
                  {cand.vision}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => setDetailCandidate(cand)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <i className="bi bi-card-text text-sm"></i>
                  <span>Baca Visi & Misi Lengkap</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenConfirm(cand)}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <i className="bi bi-hand-index-thumb-fill text-lg"></i>
                  <span>PILIH PASLON 0{cand.candidate_number}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {isConfirming && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border-4 border-blue-100 text-2xl">
              <i className="bi bi-shield-lock-fill"></i>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Konfirmasi Pilihan Suara
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pastikan pilihan Anda sudah benar sebelum disimpan.
              </p>
            </div>

            {/* Selected candidate box */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-blue-600">Pasangan Calon Terpilih</span>
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">
                  0{selectedCandidate.candidate_number}
                </span>
              </div>
              <div className="font-extrabold text-slate-900 text-base">
                {selectedCandidate.chairman_name}
              </div>
              <div className="text-xs text-slate-600">
                Wakil: <strong className="text-slate-800">{selectedCandidate.vice_chairman_name}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2">
              <i className="bi bi-exclamation-triangle-fill text-amber-500 text-base shrink-0"></i>
              <div className="leading-relaxed font-medium">
                <strong>Penting:</strong> Setiap siswa hanya berhak memberikan 1 kali suara. Pilihan ini akan disimpan secara permanen dan tidak dapat diubah kembali.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmVote}
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin"></i>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle text-base"></i>
                    <span>Ya, Kirim Suara</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vision & Mission Detail Modal */}
      {detailCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg">
                  0{detailCandidate.candidate_number}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {detailCandidate.chairman_name} &amp; {detailCandidate.vice_chairman_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Visi, Misi &amp; Program Kerja</p>
                </div>
              </div>
              <button
                onClick={() => setDetailCandidate(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {detailCandidate.slogan && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs italic font-medium text-center">
                  &ldquo;{detailCandidate.slogan}&rdquo;
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="bi bi-eye-fill"></i>
                  Visi
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-slate-800 leading-relaxed font-medium">
                  {detailCandidate.vision}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="bi bi-bullseye"></i>
                  Misi
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-slate-800 whitespace-pre-line leading-relaxed">
                  {detailCandidate.mission}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setDetailCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <button
                onClick={() => {
                  const target = detailCandidate;
                  setDetailCandidate(null);
                  handleOpenConfirm(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
              >
                <i className="bi bi-hand-index-thumb-fill"></i>
                <span>Pilih Paslon Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
