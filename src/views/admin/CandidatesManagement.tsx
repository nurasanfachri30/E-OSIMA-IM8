import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import { Candidate } from '../../types';
import { uploadImageToStorage } from '../../lib/supabase';

export const CandidatesManagement: React.FC = () => {
  const { candidates, addCandidate, updateCandidate, deleteCandidate } = useElection();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [candToDelete, setCandToDelete] = useState<Candidate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [candidateNumber, setCandidateNumber] = useState<number>(1);
  const [chairmanName, setChairmanName] = useState('');
  const [viceChairmanName, setViceChairmanName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [slogan, setSlogan] = useState('');
  const [vision, setVision] = useState('');
  const [mission, setMission] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingCandidate(null);
    setFormError(null);
    const nextNum = candidates.length > 0 ? Math.max(...candidates.map(c => c.candidate_number)) + 1 : 1;
    setCandidateNumber(nextNum);
    setChairmanName('');
    setViceChairmanName('');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');
    setSlogan('');
    setVision('');
    setMission('1. \n2. \n3. ');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cand: Candidate) => {
    setEditingCandidate(cand);
    setFormError(null);
    setCandidateNumber(cand.candidate_number);
    setChairmanName(cand.chairman_name);
    setViceChairmanName(cand.vice_chairman_name);
    setPhotoUrl(cand.photo_url || '');
    setSlogan(cand.slogan || '');
    setVision(cand.vision);
    setMission(cand.mission);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImageToStorage(file, 'candidates');
      setPhotoUrl(uploadedUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setFormError('Gagal mengunggah foto. Pastikan format berkas sesuai.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!chairmanName.trim() || !viceChairmanName.trim() || !vision.trim() || !mission.trim()) {
      setFormError('Nama ketua, wakil, visi, dan misi wajib diisi.');
      return;
    }

    if (editingCandidate) {
      await updateCandidate(editingCandidate.id, {
        candidate_number: Number(candidateNumber),
        chairman_name: chairmanName.trim(),
        vice_chairman_name: viceChairmanName.trim(),
        photo_url: photoUrl.trim(),
        slogan: slogan.trim(),
        vision: vision.trim(),
        mission: mission.trim(),
      });
      showToast(`Paslon 0${candidateNumber} berhasil diperbarui!`);
    } else {
      const success = await addCandidate({
        candidate_number: Number(candidateNumber),
        chairman_name: chairmanName.trim(),
        vice_chairman_name: viceChairmanName.trim(),
        photo_url: photoUrl.trim(),
        slogan: slogan.trim(),
        vision: vision.trim(),
        mission: mission.trim(),
      });

      if (!success) {
        setFormError(`Nomor urut ${candidateNumber} sudah digunakan oleh paslon lain.`);
        return;
      }
      showToast(`Paslon 0${candidateNumber} berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!candToDelete) return;
    const num = candToDelete.candidate_number;
    await deleteCandidate(candToDelete.id);
    setCandToDelete(null);
    showToast(`Paslon 0${num} berhasil dihapus.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-in slide-in-from-top-4">
          <i className="bi bi-check-circle-fill text-emerald-400 text-base"></i>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pasangan Calon (Paslon)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Calon Kandidat OSIS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kelola nomor urut, foto, nama calon ketua & wakil, visi, misi, dan slogan
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
        >
          <i className="bi bi-person-plus-fill text-sm"></i>
          <span>Tambah Paslon Baru</span>
        </button>
      </div>

      {/* Candidates Cards Grid */}
      {candidates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
          <i className="bi bi-person-badge text-4xl text-slate-300 block"></i>
          <h3 className="font-bold text-slate-700 text-base">Belum Ada Calon Kandidat</h3>
          <p className="text-xs max-w-sm mx-auto">
            Klik tombol <strong>&ldquo;Tambah Paslon Baru&rdquo;</strong> di atas untuk mendaftarkan kandidat ketua dan wakil ketua OSIS.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
          >
            <i className="bi bi-plus-lg"></i>
            Tambah Paslon Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Card Top */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Kandidat Paslon
                  </span>
                  <span className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                    0{cand.candidate_number}
                  </span>
                </div>

                {/* Photo */}
                <div className="aspect-4/3 bg-slate-100 relative overflow-hidden">
                  {cand.photo_url ? (
                    <img
                      src={cand.photo_url}
                      alt={`Paslon 0${cand.candidate_number}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <i className="bi bi-people-fill text-5xl"></i>
                    </div>
                  )}
                  {cand.slogan && (
                    <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-slate-900/90 to-transparent text-white text-xs italic font-medium">
                      &ldquo;{cand.slogan}&rdquo;
                    </div>
                  )}
                </div>

                {/* Names */}
                <div className="p-5 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Calon Ketua OSIS
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{cand.chairman_name}</h3>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      Calon Wakil Ketua OSIS
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{cand.vice_chairman_name}</h4>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800">Visi:</div>
                    <p className="line-clamp-2 leading-relaxed">{cand.vision}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 font-mono">
                  {cand.vote_count || 0} Suara
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cand)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <i className="bi bi-pencil-square"></i>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandToDelete(cand)}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <i className="bi bi-trash3-fill"></i>
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-App Delete Confirmation Modal (Replaces blocked window.confirm) */}
      {candToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-slate-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border-4 border-rose-100 text-2xl">
              <i className="bi bi-trash3-fill"></i>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Hapus Pasangan Calon?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong>Paslon 0{candToDelete.candidate_number}</strong> ({candToDelete.chairman_name} &amp; {candToDelete.vice_chairman_name}) dari daftar pemilihan?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCandToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/25 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="bi bi-trash3-fill"></i>
                <span>Ya, Hapus Paslon</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Candidate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingCandidate ? 'Edit Data Pasangan Calon' : 'Tambah Pasangan Calon Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <i className="bi bi-exclamation-circle-fill text-rose-600"></i>
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor Urut
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={candidateNumber}
                    onChange={(e) => setCandidateNumber(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bersama Mewujudkan Generasi Emas"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Calon Ketua OSIS
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Ketua"
                    value={chairmanName}
                    onChange={(e) => setChairmanName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Calon Wakil Ketua OSIS
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Wakil"
                    value={viceChairmanName}
                    onChange={(e) => setViceChairmanName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Photo section */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">
                  Foto Paslon (Supabase Storage / URL)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <i className="bi bi-image text-xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Masukkan URL foto atau unggah berkas"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors">
                        <i className="bi bi-cloud-arrow-up-fill text-blue-600"></i>
                        <span>{isUploading ? 'Mengunggah...' : 'Unggah Foto ke Supabase'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Visi
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Visi calon ketua dan wakil..."
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Misi (Program Kerja Pokok)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="1. Program keagamaan dan budi pekerti&#10;2. Peningkatan ekstrakurikuler..."
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingCandidate ? 'Simpan Perubahan' : 'Tambah Paslon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
