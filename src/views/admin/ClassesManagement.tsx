import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import { ClassItem } from '../../types';

export const ClassesManagement: React.FC = () => {
  const { classes, students, addClass, updateClass, deleteClass } = useElection();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [classToDelete, setClassToDelete] = useState<{ id: string; name: string; count: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [level, setLevel] = useState('VII');
  const [major, setMajor] = useState('-');
  const [homeroomTeacher, setHomeroomTeacher] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.homeroom_teacher && c.homeroom_teacher.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingClass(null);
    setName('');
    setLevel('VII');
    setMajor('-');
    setHomeroomTeacher('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setName(cls.name);
    setLevel(cls.level);
    setMajor(cls.major || '');
    setHomeroomTeacher(cls.homeroom_teacher || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingClass) {
      await updateClass(editingClass.id, {
        name: name.trim(),
        level,
        major: major.trim(),
        homeroom_teacher: homeroomTeacher.trim(),
      });
      showToast(`Kelas "${name}" berhasil diperbarui!`);
    } else {
      await addClass({
        name: name.trim(),
        level,
        major: major.trim(),
        homeroom_teacher: homeroomTeacher.trim(),
      });
      showToast(`Kelas "${name}" berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;
    const clsName = classToDelete.name;
    await deleteClass(classToDelete.id);
    setClassToDelete(null);
    showToast(`Kelas "${clsName}" berhasil dihapus.`);
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manajemen Rombel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Data Kelas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kelola daftar kelas dan rombongan belajar pemilih OSIS
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
        >
          <i className="bi bi-plus-lg text-sm"></i>
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i className="bi bi-search text-xs"></i>
          </div>
          <input
            type="text"
            placeholder="Cari nama kelas atau wali kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs text-slate-800 transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium w-full sm:w-auto text-right">
          Total: <strong className="text-slate-800">{classes.length}</strong> kelas terdaftar
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 w-14">No</th>
                <th className="px-5 py-3.5">Nama Kelas</th>
                <th className="px-5 py-3.5">Tingkat</th>
                <th className="px-5 py-3.5">Jurusan / Peminatan</th>
                <th className="px-5 py-3.5">Wali Kelas</th>
                <th className="px-5 py-3.5 text-center">Jumlah Siswa</th>
                <th className="px-5 py-3.5 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <i className="bi bi-inbox text-3xl block mb-2 opacity-50"></i>
                    Belum ada data kelas yang sesuai
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls, index) => {
                  const studentCount = students.filter(s => s.class_name === cls.name).length;
                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-400 font-semibold">{index + 1}</td>
                      <td className="px-5 py-3.5 font-extrabold text-slate-800 text-sm">
                        {cls.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold font-mono">
                          {cls.level}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-600">
                        {cls.major || '-'}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {cls.homeroom_teacher || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold font-mono">
                          {studentCount} siswa
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cls)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Kelas"
                          >
                            <i className="bi bi-pencil-square text-sm"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => setClassToDelete({ id: cls.id, name: cls.name, count: studentCount })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Kelas"
                          >
                            <i className="bi bi-trash3-fill text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-slate-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border-4 border-rose-100 text-2xl">
              <i className="bi bi-trash3-fill"></i>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Hapus Kelas {classToDelete.name}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {classToDelete.count > 0 ? (
                  <span>
                    Kelas ini masih memiliki <strong>{classToDelete.count} siswa</strong> terdaftar. Apakah Anda tetap ingin menghapus kelas ini?
                  </span>
                ) : (
                  <span>Apakah Anda yakin ingin menghapus kelas ini dari daftar?</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
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
                <span>Ya, Hapus Kelas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: VII.2, VIII.1, X MIPA 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tingkat
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  >
                    <option value="VII">VII (SMP)</option>
                    <option value="VIII">VIII (SMP)</option>
                    <option value="IX">IX (SMP)</option>
                    <option value="X">X (SMA/SMK)</option>
                    <option value="XI">XI (SMA/SMK)</option>
                    <option value="XII">XII (SMA/SMK)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jurusan / Program
                  </label>
                  <input
                    type="text"
                    placeholder="MIPA, IPS, RPL, -"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Wali Kelas
                </label>
                <input
                  type="text"
                  placeholder="Nama Lengkap & Gelar Wali Kelas"
                  value={homeroomTeacher}
                  onChange={(e) => setHomeroomTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
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
                  {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
