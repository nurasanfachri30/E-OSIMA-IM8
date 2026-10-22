import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';

export const VoteResults: React.FC = () => {
  const { candidates, students, settings, resetAllVotes } = useElection();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetCodeInput, setResetCodeInput] = useState('');

  const totalDpt = students.length;
  const totalVotesCast = candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);
  const unvotedCount = Math.max(0, totalDpt - totalVotesCast);
  const participationRate = totalDpt > 0 ? ((totalVotesCast / totalDpt) * 100).toFixed(1) : '0';

  // Sort candidates by votes descending
  const sortedCandidates = [...candidates].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  const leadingCandidate = sortedCandidates[0]?.vote_count > 0 ? sortedCandidates[0] : null;

  const handlePrint = () => {
    window.print();
  };

  const handleExecuteReset = async () => {
    if (resetCodeInput !== 'RESET') {
      alert('Ketik kata "RESET" dengan huruf kapital untuk konfirmasi.');
      return;
    }
    await resetAllVotes();
    setIsResetConfirmOpen(false);
    setResetCodeInput('');
  };

  // Color palette for charts
  const colors = [
    { bar: 'bg-blue-600', fill: '#2563eb', text: 'text-blue-600', border: 'border-blue-500' },
    { bar: 'bg-indigo-600', fill: '#4f46e5', text: 'text-indigo-600', border: 'border-indigo-500' },
    { bar: 'bg-emerald-600', fill: '#059669', text: 'text-emerald-600', border: 'border-emerald-500' },
    { bar: 'bg-amber-600', fill: '#d97706', text: 'text-amber-600', border: 'border-amber-500' },
    { bar: 'bg-rose-600', fill: '#e11d48', text: 'text-rose-600', border: 'border-rose-500' },
  ];

  // Calculate SVG donut slice paths
  let accumulatedAngle = 0;
  const donutSlices = candidates.map((cand, idx) => {
    const votes = cand.vote_count || 0;
    const percentage = totalVotesCast > 0 ? votes / totalVotesCast : 0;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;

    return {
      cand,
      percentage: (percentage * 100).toFixed(1),
      startAngle,
      angle,
      color: colors[idx % colors.length],
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Count &amp; Real Count</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Perolehan Suara
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Hasil rekapitulasi suara pemilihan ketua dan wakil ketua OSIS {settings.election_period}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <i className="bi bi-printer-fill text-sm"></i>
            <span>Cetak Rekapitulasi</span>
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <i className="bi bi-arrow-counterclockwise text-sm"></i>
            <span>Reset Seluruh Suara</span>
          </button>
        </div>
      </div>

      {/* Printable Document Header (shown only when printing) */}
      <div className="hidden print-only p-6 border-b-2 border-slate-900 text-center space-y-1">
        <h2 className="text-xl font-black uppercase tracking-wider">{settings.school_name}</h2>
        <h3 className="text-base font-bold">BERITA ACARA REKAPITULASI HASIL PEMILIHAN OSIS</h3>
        <p className="text-xs font-mono">{settings.election_period} • Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Total DPT</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{totalDpt}</div>
          <span className="text-[11px] text-slate-500 font-medium">Pemilih Terdaftar</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-200 bg-blue-50/20 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-blue-600 block mb-1">Suara Masuk</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">{totalVotesCast}</div>
          <span className="text-[11px] text-blue-600 font-medium">Surat Suara Sah</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-emerald-600 block mb-1">Partisipasi</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">{participationRate}%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Tingkat Kehadiran</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-amber-600 block mb-1">Belum Memilih</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">{unvotedCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">Sisa Hak Suara</span>
        </div>
      </div>

      {/* Leading Paslon Banner */}
      {leadingCandidate && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 text-white font-black text-2xl flex items-center justify-center shrink-0">
              0{leadingCandidate.candidate_number}
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Perolehan Suara Terbanyak Sementara
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-1">
                {leadingCandidate.chairman_name} &amp; {leadingCandidate.vice_chairman_name}
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Mendapat {leadingCandidate.vote_count} suara ({((leadingCandidate.vote_count / Math.max(1, totalVotesCast)) * 100).toFixed(1)}%)
              </p>
            </div>
          </div>

          <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/20 text-center shrink-0">
            <div className="text-2xl font-black font-mono">{leadingCandidate.vote_count}</div>
            <div className="text-[11px] uppercase tracking-wider text-emerald-100 font-bold">Suara Sah</div>
          </div>
        </div>
      )}

      {/* Main Charts & Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Grafik Batang Perolehan Suara</h3>
              <p className="text-xs text-slate-500 font-medium">Komparasi total suara masing-masing pasangan calon</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">Total: {totalVotesCast} Suara</span>
          </div>

          <div className="space-y-5 pt-2">
            {candidates.map((cand, idx) => {
              const votes = cand.vote_count || 0;
              const percent = totalVotesCast > 0 ? ((votes / totalVotesCast) * 100).toFixed(1) : '0';
              const color = colors[idx % colors.length];

              return (
                <div key={cand.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg ${color.bar} text-white font-extrabold flex items-center justify-center text-[11px]`}>
                        0{cand.candidate_number}
                      </span>
                      <span className="font-extrabold text-slate-800 text-sm">
                        {cand.chairman_name} &amp; {cand.vice_chairman_name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-slate-900 text-sm mr-2">{votes} Suara</span>
                      <span className={`font-bold font-mono ${color.text}`}>({percent}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full ${color.bar} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${Math.max(Number(percent), votes > 0 ? 3 : 0)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Circular / Donut Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Distribusi Suara (Proporsi)</h3>
            <p className="text-xs text-slate-500 font-medium">Persentase porsi suara dari total suara sah masuk</p>
          </div>

          {/* SVG Donut */}
          <div className="flex items-center justify-center py-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {totalVotesCast === 0 ? (
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#e2e8f0" strokeWidth="18" />
                ) : (
                  donutSlices.map((slice, i) => {
                    const strokeDasharray = `${(slice.angle / 360) * (2 * Math.PI * 38)} ${2 * Math.PI * 38}`;
                    const strokeDashoffset = -((slice.startAngle / 360) * (2 * Math.PI * 38));
                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={slice.color.fill}
                        strokeWidth="18"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700"
                      />
                    );
                  })
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Suara</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{totalVotesCast}</span>
                <span className="text-[10px] text-emerald-600 font-bold">{participationRate}% DPT</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {donutSlices.map((slice, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-3 h-3 rounded-full ${slice.color.bar} shrink-0`}></span>
                  <span className="font-medium text-slate-700 truncate">
                    Paslon 0{slice.cand.candidate_number} ({slice.cand.chairman_name})
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">
                  {slice.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-extrabold text-slate-900 text-base">Tabel Rekapitulasi Suara Per Paslon</h3>
          <span className="text-xs font-semibold text-slate-500">Urut Berdasarkan Perolehan Suara</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 w-16">Peringkat</th>
                <th className="px-5 py-3.5 w-16 text-center">No. Urut</th>
                <th className="px-5 py-3.5">Calon Ketua &amp; Wakil Ketua</th>
                <th className="px-5 py-3.5">Slogan</th>
                <th className="px-5 py-3.5 text-right">Jumlah Suara</th>
                <th className="px-5 py-3.5 text-right">Persentase</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCandidates.map((cand, index) => {
                const votes = cand.vote_count || 0;
                const percent = totalVotesCast > 0 ? ((votes / totalVotesCast) * 100).toFixed(1) : '0';
                const isWinner = index === 0 && votes > 0;

                return (
                  <tr key={cand.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-bold font-mono text-slate-600">
                      #{index + 1}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold inline-flex items-center justify-center text-xs shadow-xs">
                        0{cand.candidate_number}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {cand.chairman_name}
                      </div>
                      <div className="text-slate-500 font-medium">
                        Wakil: {cand.vice_chairman_name}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 italic max-w-xs truncate">
                      {cand.slogan || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-black text-slate-900 text-sm">
                      {votes} Suara
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-extrabold text-blue-600 text-sm">
                      {percent}%
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isWinner ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1">
                          <i className="bi bi-trophy-fill text-amber-500"></i>
                          Unggul
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
                          Kandidat
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strict Privacy Guarantee Box */}
      <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 text-xs border border-slate-800 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
          <i className="bi bi-shield-shaded text-lg"></i>
        </div>
        <div className="space-y-1">
          <div className="font-bold text-white">Prinsip Kerahasiaan Pemilihan (LUBER JURDIL):</div>
          <p className="leading-relaxed text-slate-400">
            Sistem eOSIS tidak pernah mencatat atau mengaitkan ID / NISN siswa dengan kandidat yang dipilih pada database atau tampilan admin. Admin hanya dapat melihat agregat perolehan suara kandidat dan status siswa apakah sudah atau belum memilih, menjamin kebebasan dan kerahasiaan suara pemilih secara mutlak.
          </p>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-slate-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border-4 border-rose-100 text-2xl">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Reset Seluruh Data Suara?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini akan mengosongkan perolehan suara seluruh kandidat menjadi 0 dan mengembalikan status seluruh siswa menjadi &ldquo;Belum Memilih&rdquo;. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="space-y-1.5 text-left text-xs">
              <label className="font-bold text-slate-700">
                Ketik <span className="font-mono text-rose-600 font-black">RESET</span> untuk konfirmasi:
              </label>
              <input
                type="text"
                placeholder="RESET"
                value={resetCodeInput}
                onChange={(e) => setResetCodeInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-300 font-mono text-center text-sm font-bold tracking-wider"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  setResetCodeInput('');
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={resetCodeInput !== 'RESET'}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-rose-500/25 cursor-pointer"
              >
                Ya, Reset Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
