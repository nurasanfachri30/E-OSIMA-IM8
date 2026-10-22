import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useElection } from '../../context/ElectionContext';
import { Student } from '../../types';
import { formatDateIndonesian, normalizeDateToYMD } from '../../lib/dateUtils';

export const StudentsManagement: React.FC = () => {
  const { 
    students, 
    classes, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    resetStudentVote, 
    importStudents 
  } = useElection();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VOTED' | 'NOT_VOTED'>('ALL');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentToReset, setStudentToReset] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form states
  const [nisn, setNisn] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('2009-01-01');
  const [className, setClassName] = useState('');
  const [customClassName, setCustomClassName] = useState('');
  const [isCustomClass, setIsCustomClass] = useState(false);
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Import states
  const [importTab, setImportTab] = useState<'file' | 'paste'>('file');
  const [pasteContent, setPasteContent] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Array<{ nisn: string; name: string; birth_date: string; class_name: string }>>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredStudents = students.filter(stu => {
    const matchesSearch =
      stu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.nisn.includes(searchTerm);
    const matchesClass = filterClass === 'ALL' || stu.class_name === filterClass;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'VOTED' && stu.has_voted) ||
      (filterStatus === 'NOT_VOTED' && !stu.has_voted);

    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormError(null);
    setNisn('');
    setName('');
    setBirthDate('2009-01-01');
    const defaultCls = classes[0]?.name || 'VII.2';
    setClassName(defaultCls);
    setCustomClassName('');
    setIsCustomClass(false);
    setGender('Laki-laki');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormError(null);
    setNisn(stu.nisn);
    setName(stu.name);
    setBirthDate(stu.birth_date || '2009-01-01');
    
    const inList = classes.some(c => c.name === stu.class_name);
    if (inList) {
      setClassName(stu.class_name);
      setIsCustomClass(false);
      setCustomClassName('');
    } else {
      setClassName('__CUSTOM__');
      setIsCustomClass(true);
      setCustomClassName(stu.class_name);
    }

    setGender(stu.gender || 'Laki-laki');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const targetClass = isCustomClass ? customClassName.trim() : className.trim();

    if (!nisn.trim()) {
      setFormError('NISN wajib diisi.');
      return;
    }
    if (!name.trim()) {
      setFormError('Nama lengkap siswa wajib diisi.');
      return;
    }
    if (!targetClass) {
      setFormError('Kelas wajib dipilih atau diisi.');
      return;
    }

    const duplicate = students.find(s => s.nisn === nisn.trim() && (!editingStudent || s.id !== editingStudent.id));
    if (duplicate) {
      setFormError(`NISN "${nisn}" sudah terdaftar atas nama ${duplicate.name}!`);
      return;
    }

    if (editingStudent) {
      await updateStudent(editingStudent.id, {
        nisn: nisn.trim(),
        name: name.trim(),
        birth_date: birthDate || '2009-01-01',
        class_name: targetClass,
        gender,
      });
      showToast(`Data siswa "${name}" berhasil diperbarui!`);
    } else {
      const success = await addStudent({
        nisn: nisn.trim(),
        name: name.trim(),
        birth_date: birthDate || '2009-01-01',
        class_name: targetClass,
        gender,
      });
      if (!success) {
        setFormError('Gagal menambahkan siswa. Pastikan NISN belum terdaftar.');
        return;
      }
      showToast(`Siswa "${name}" berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    const stuName = studentToDelete.name;
    await deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
    showToast(`Data siswa "${stuName}" berhasil dihapus.`);
  };

  const confirmResetVote = async () => {
    if (!studentToReset) return;
    const stuName = studentToReset.name;
    await resetStudentVote(studentToReset.id);
    setStudentToReset(null);
    showToast(`Hak suara siswa "${stuName}" berhasil direset.`);
  };

  const handleOpenImport = () => {
    setPasteContent('');
    setParsedPreview([]);
    setImportError(null);
    setUploadedFileName(null);
    setIsImportModalOpen(true);
  };

  // Helper function to safely parse Excel dates or strings without timezone drift
  const parseDateCell = (raw: unknown): string => {
    return normalizeDateToYMD(raw) || '2008-01-01';
  };

  // 1. Download Genuine Excel (.xlsx) Sheet Template (4 Columns)
  const downloadExcelTemplate = () => {
    const data = [
      ['NISN', 'Nama Siswa', 'Tanggal Lahir', 'Kelas'],
      ['0081234561', 'Ahmad Rizky Pratama', '2009-05-14', 'VII.2'],
      ['0081234562', 'Bella Anindya Putri', '2009-08-22', 'VII.2'],
      ['0081234563', 'Dimas Satria Wijaya', '2009-01-30', 'VII.2'],
      ['0081234564', 'Eka Nur Halizah', '2008-11-19', 'VIII.1'],
      ['0081234565', 'Fajar Ramadhan', '2007-03-25', 'IX.2'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 18 }, // Kolom 1 (A): NISN
      { wch: 32 }, // Kolom 2 (B): Nama Siswa
      { wch: 22 }, // Kolom 3 (C): Tanggal Lahir (YYYY-MM-DD)
      { wch: 15 }, // Kolom 4 (D): Kelas
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    XLSX.writeFile(workbook, 'Template_Impor_Siswa_eOSIS.xlsx');
    showToast('Template Sheet Excel (4 Kolom) berhasil diunduh!');
  };

  // 2. Download CSV Template (4 Columns)
  const downloadCsvTemplate = () => {
    const csvContent = 'NISN,Nama Siswa,Tanggal Lahir,Kelas\n0081234561,Ahmad Rizky Pratama,2009-05-14,VII.2\n0081234562,Bella Anindya Putri,2009-08-22,VII.2\n0081234563,Dimas Satria Wijaya,2009-01-30,VII.2\n0081234564,Eka Nur Halizah,2008-11-19,VIII.1\n0081234565,Fajar Ramadhan,2007-03-25,IX.2';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Impor_Siswa_eOSIS.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Template CSV (4 Kolom) berhasil diunduh!');
  };

  // 3. Process raw array of rows from Sheet or text with Smart Column & Header Detection
  const processRows = (rawRows: (string | number)[][]) => {
    setImportError(null);
    const parsed: Array<{ nisn: string; name: string; birth_date: string; class_name: string }> = [];

    if (!rawRows || rawRows.length === 0) {
      setParsedPreview([]);
      setImportError('Berkas atau teks tidak berisi data.');
      return;
    }

    // Step A: Scan first 5 rows to detect header row and column mapping
    let headerRowIdx = -1;
    let colNisn = -1;
    let colName = -1;
    let colBirth = -1;
    let colClass = -1;

    for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
      const row = rawRows[r];
      if (!row || row.length < 2) continue;
      const lowerRow = row.map(cell => String(cell || '').toLowerCase().trim());

      const idxNisn = lowerRow.findIndex(c => c.includes('nisn'));
      const idxName = lowerRow.findIndex(c => c.includes('nama') || c.includes('siswa') || c.includes('name'));
      const idxBirth = lowerRow.findIndex(c => c.includes('lahir') || c.includes('tgl') || c.includes('tanggal') || c.includes('birth') || c.includes('dob'));
      const idxClass = lowerRow.findIndex(c => c.includes('kelas') || c.includes('rombel') || c.includes('tingkat') || c.includes('class'));

      if (idxNisn !== -1 && idxName !== -1) {
        headerRowIdx = r;
        colNisn = idxNisn;
        colName = idxName;
        colBirth = idxBirth;
        colClass = idxClass;
        break;
      }
    }

    // If no header row detected, default to standard column layouts
    if (headerRowIdx === -1) {
      const sampleRow = rawRows.find(r => r && r.length >= 2) || [];
      // If 5+ columns and Col 0 looks like row index (e.g. 1, 2, 3...)
      const col0Str = String(sampleRow[0] || '').trim();
      const isCol0RowIndex = /^\d{1,4}$/.test(col0Str) && parseInt(col0Str, 10) < 1000;

      if (sampleRow.length >= 5 && isCol0RowIndex) {
        colNisn = 1;
        colName = 2;
        colBirth = 3;
        colClass = 4;
      } else if (sampleRow.length >= 4) {
        colNisn = 0;
        colName = 1;
        colBirth = 2;
        colClass = 3;
      } else if (sampleRow.length === 3) {
        colNisn = 0;
        colName = 1;
        colBirth = -1;
        colClass = 2;
      } else {
        colNisn = 0;
        colName = 1;
        colBirth = 2;
        colClass = 3;
      }
    }

    const startIdx = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;

    for (let i = startIdx; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0) continue;

      const rawNisn = String(row[colNisn] !== undefined ? row[colNisn] : '').trim();
      const rawName = String(row[colName] !== undefined ? row[colName] : '').trim();
      const rawBirth = colBirth !== -1 && row[colBirth] !== undefined ? row[colBirth] : '';
      const rawClass = colClass !== -1 && row[colClass] !== undefined ? String(row[colClass]).trim() : '';

      // Skip empty or repeat header rows
      if (!rawNisn && !rawName) continue;
      if (rawNisn.toLowerCase().includes('nisn') || rawName.toLowerCase().includes('nama')) continue;

      // Clean NISN: keep digits/letters, preserve leading zeros
      const cleanNisn = rawNisn.replace(/\s+/g, '');
      const cleanName = rawName;
      const cleanBirth = parseDateCell(rawBirth);
      const cleanClass = rawClass || 'VII.1';

      if (cleanNisn && cleanName) {
        parsed.push({
          nisn: cleanNisn,
          name: cleanName,
          birth_date: cleanBirth,
          class_name: cleanClass,
        });
      }
    }

    if (parsed.length === 0) {
      setImportError('Format berkas tidak sesuai. Pastikan terdapat Kolom NISN, Nama Siswa, Tanggal Lahir (YYYY-MM-DD atau DD/MM/YYYY), dan Kelas.');
    }

    setParsedPreview(parsed);
  };

  // 4. Handle Excel Sheet / CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: false, raw: true });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          setImportError('Tidak ditemukan lembar kerja (sheet) pada berkas.');
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        // Convert sheet to array of rows
        const rows: (string | number)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' });
        processRows(rows);
      } catch (err) {
        console.error('Error reading sheet file:', err);
        setImportError('Gagal membaca berkas sheet. Pastikan format berkas berupa .xlsx, .xls, atau .csv.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 5. Parse Copy-Pasted Text from Spreadsheet
  const parseRawStudentText = (text: string) => {
    setImportError(null);
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setParsedPreview([]);
      return;
    }

    const rows: string[][] = lines.map(line => {
      if (line.includes('\t')) {
        return line.split('\t').map(p => p.trim());
      } else if (line.includes(';')) {
        return line.split(';').map(p => p.trim());
      } else {
        return line.split(',').map(p => p.trim());
      }
    });

    processRows(rows);
  };


  const handleExecuteImport = async () => {
    if (parsedPreview.length === 0) {
      setImportError('Tidak ada data siswa yang valid untuk diimpor.');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const result = await importStudents(parsedPreview);
      if (result.success) {
        setIsImportModalOpen(false);
        showToast(result.message);
      } else {
        setImportError(result.message);
      }
    } catch {
      setImportError('Terjadi kesalahan saat menyimpan data impor.');
    } finally {
      setIsImporting(false);
    }
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daftar Pemilih Tetap (DPT)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Data Siswa / User
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kelola data pemilih siswa, status hak suara, dan impor template sheet 4 kolom (NISN, Nama Siswa, Tanggal Lahir, Kelas)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Import Button */}
          <button
            type="button"
            onClick={handleOpenImport}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <i className="bi bi-file-earmark-spreadsheet-fill text-emerald-600 text-base"></i>
            <span>Impor Sheet Siswa</span>
          </button>

          {/* Add Student Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <i className="bi bi-person-plus-fill text-sm"></i>
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i className="bi bi-search"></i>
          </div>
          <input
            type="text"
            placeholder="Cari NISN atau Nama siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Filter Class */}
        <div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
          >
            <option value="ALL">Semua Kelas ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Vote Status */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'VOTED' | 'NOT_VOTED')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
          >
            <option value="ALL">Semua Status Hak Suara</option>
            <option value="VOTED">Sudah Memilih</option>
            <option value="NOT_VOTED">Belum Memilih</option>
          </select>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-end px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 font-medium">
          Ditemukan: <strong className="text-slate-900 ml-1 font-mono">{filteredStudents.length}</strong> / {students.length} Siswa
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 w-12">No</th>
                <th className="px-5 py-3.5">NISN (Kolom 1)</th>
                <th className="px-5 py-3.5">Nama Siswa (Kolom 2)</th>
                <th className="px-5 py-3.5">Tanggal Lahir (Kolom 3)</th>
                <th className="px-5 py-3.5">Kelas (Kolom 4)</th>
                <th className="px-5 py-3.5">Gender</th>
                <th className="px-5 py-3.5 text-center">Status Memilih</th>
                <th className="px-5 py-3.5 text-right w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <i className="bi bi-people text-3xl block mb-2 opacity-50"></i>
                    Belum ada data siswa yang terdaftar. <br />
                    <button
                      type="button"
                      onClick={handleOpenImport}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer"
                    >
                      Impor Data Siswa Sekarang (Sheet Excel / CSV)
                    </button>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu, index) => (
                  <tr key={stu.id || stu.nisn} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-400 font-semibold">{index + 1}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                      {stu.nisn}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900 text-sm">
                      {stu.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-emerald-800 font-bold">
                        {stu.birth_date || '-'}
                      </div>
                      {stu.birth_date && (
                        <div className="text-[10px] text-slate-500 font-medium">
                          {formatDateIndonesian(stu.birth_date)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold font-mono">
                        {stu.class_name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {stu.gender || 'Laki-laki'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {stu.has_voted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                          <i className="bi bi-check-circle-fill text-emerald-500"></i>
                          Sudah Memilih
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px]">
                          <i className="bi bi-clock-history text-amber-500"></i>
                          Belum Memilih
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {stu.has_voted && (
                          <button
                            type="button"
                            onClick={() => setStudentToReset(stu)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Reset Hak Suara Siswa"
                          >
                            <i className="bi bi-arrow-counterclockwise text-sm"></i>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(stu)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Data Siswa"
                        >
                          <i className="bi bi-pencil-square text-sm"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(stu)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <i className="bi bi-trash3-fill text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru (DPT)'}
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
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <i className="bi bi-exclamation-circle-fill text-rose-600"></i>
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    NISN (Kolom 1)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0081234567"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tanggal Lahir (Kolom 3)
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Siswa (Kolom 2)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Farhan Pratama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kelas (Kolom 4)
                  </label>
                  {isCustomClass ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        required
                        placeholder="Ketik nama kelas (cth: VII.2)"
                        value={customClassName}
                        onChange={(e) => setCustomClassName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomClass(false);
                          setClassName(classes[0]?.name || 'VII.2');
                        }}
                        className="text-[10px] text-blue-600 hover:underline"
                      >
                        Pilih dari daftar kelas
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <select
                        value={className}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomClass(true);
                          } else {
                            setClassName(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                        <option value="__CUSTOM__">+ Tulis Kelas Baru / Lainnya</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jenis Kelamin
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
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
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-slate-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border-4 border-rose-100 text-2xl">
              <i className="bi bi-trash3-fill"></i>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Hapus Data Siswa?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus data siswa <strong>{studentToDelete.name}</strong> (NISN: {studentToDelete.nisn}, Kelas: {studentToDelete.class_name})?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
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
                <span>Ya, Hapus Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Reset Vote Confirmation Modal */}
      {studentToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-slate-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-4 border-amber-100 text-2xl">
              <i className="bi bi-arrow-counterclockwise"></i>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Reset Hak Suara Siswa?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Status siswa <strong>{studentToReset.name}</strong> akan diubah kembali menjadi <strong>&ldquo;Belum Memilih&rdquo;</strong> sehingga siswa dapat masuk ke bilik suara kembali.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToReset(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmResetVote}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                <span>Ya, Reset Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Impor Sheet Data Siswa (Kolom 1: NISN, Kolom 2: Nama Siswa, Kolom 3: Tanggal Lahir, Kolom 4: Kelas) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
                  <i className="bi bi-file-earmark-excel-fill"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Template &amp; Impor Sheet Data Siswa
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Struktur 4 Kolom: <strong className="text-slate-800">Kolom 1: NISN</strong>, <strong className="text-slate-800">Kolom 2: Nama Siswa</strong>, <strong className="text-slate-800">Kolom 3: Tanggal Lahir</strong>, <strong className="text-slate-800">Kolom 4: Kelas</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Login Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-blue-900">
                <i className="bi bi-shield-lock-fill text-blue-600 text-lg shrink-0 mt-0.5"></i>
                <div className="leading-relaxed">
                  <span className="font-bold">Keperluan Login Siswa:</span> Siswa akan masuk ke bilik suara menggunakan <strong>NISN (Kolom 1)</strong> dan <strong>Tanggal Lahir (Kolom 3)</strong>. Format tanggal lahir yang disarankan adalah <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-blue-800 font-bold">YYYY-MM-DD</code> (contoh: 2009-05-14) atau <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-blue-800 font-bold">DD/MM/YYYY</code>.
                </div>
              </div>

              {/* Visual Sheet Column Architecture Preview */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Struktur Sheet Lembar Kerja Excel / Spreadsheet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadExcelTemplate}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      title="Unduh berkas Excel .xlsx resmi 4 kolom"
                    >
                      <i className="bi bi-file-earmark-excel"></i>
                      <span>Unduh Template Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadCsvTemplate}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                    >
                      <i className="bi bi-filetype-csv"></i>
                      <span>Unduh CSV</span>
                    </button>
                  </div>
                </div>

                {/* Spreadsheet Visual Mockup */}
                <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="bg-slate-100 px-3 py-1 text-[11px] font-mono text-slate-600 border-b border-slate-200 flex items-center gap-2">
                    <i className="bi bi-table text-emerald-600"></i>
                    <span>Lembar: <strong>Data Siswa</strong></span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 w-10 text-center bg-slate-100 border-r border-slate-200 text-slate-400">#</th>
                          <th className="px-3 py-2 border-r border-slate-200 text-blue-800 font-bold">Kolom 1 (A)<br /><span className="text-[10px] text-slate-400 font-normal">NISN</span></th>
                          <th className="px-4 py-2 border-r border-slate-200 text-emerald-800 font-bold">Kolom 2 (B)<br /><span className="text-[10px] text-slate-400 font-normal">Nama Siswa</span></th>
                          <th className="px-4 py-2 border-r border-slate-200 text-amber-800 font-bold">Kolom 3 (C)<br /><span className="text-[10px] text-slate-400 font-normal">Tanggal Lahir</span></th>
                          <th className="px-3 py-2 text-indigo-800 font-bold">Kolom 4 (D)<br /><span className="text-[10px] text-slate-400 font-normal">Kelas</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        <tr className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 text-center bg-slate-50/80 border-r border-slate-200 text-slate-400 font-sans">1</td>
                          <td className="px-3 py-1.5 border-r border-slate-200 font-bold text-slate-800">0081234561</td>
                          <td className="px-4 py-1.5 border-r border-slate-200 text-slate-900 font-sans font-medium">Ahmad Rizky Pratama</td>
                          <td className="px-4 py-1.5 border-r border-slate-200 text-amber-800 font-bold">2009-05-14</td>
                          <td className="px-3 py-1.5 text-blue-700 font-bold font-sans">VII.2</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 text-center bg-slate-50/80 border-r border-slate-200 text-slate-400 font-sans">2</td>
                          <td className="px-3 py-1.5 border-r border-slate-200 font-bold text-slate-800">0081234562</td>
                          <td className="px-4 py-1.5 border-r border-slate-200 text-slate-900 font-sans font-medium">Bella Anindya Putri</td>
                          <td className="px-4 py-1.5 border-r border-slate-200 text-amber-800 font-bold">2009-08-22</td>
                          <td className="px-3 py-1.5 text-blue-700 font-bold font-sans">VII.2</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 text-center bg-slate-50/80 border-r border-slate-200 text-slate-400 font-sans">3</td>
                          <td className="px-3 py-1.5 border-r border-slate-200 font-bold text-slate-800">0081234563</td>
                          <td className="px-4 py-1.5 border-r border-slate-200 text-slate-900 font-sans font-medium">Dimas Satria Wijaya</td>
                          <td className="px-4 py-1.5 border-r border-slate-200 text-amber-800 font-bold">2009-01-30</td>
                          <td className="px-3 py-1.5 text-blue-700 font-bold font-sans">VII.2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setImportTab('file')}
                  className={`py-2.5 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                    importTab === 'file'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="bi bi-file-earmark-excel"></i>
                  <span>Unggah Berkas Sheet (.xlsx / .xls / .csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab('paste')}
                  className={`py-2.5 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                    importTab === 'paste'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="bi bi-clipboard-data"></i>
                  <span>Salin &amp; Tempel (Copy-Paste dari Sheet)</span>
                </button>
              </div>

              {importError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <i className="bi bi-exclamation-circle-fill text-rose-600 text-base shrink-0"></i>
                  <span className="font-medium">{importError}</span>
                </div>
              )}

              {/* Method 1: File Upload */}
              {importTab === 'file' && (
                <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center space-y-3 bg-emerald-50/20">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl">
                    <i className="bi bi-file-earmark-arrow-up-fill"></i>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Pilih Berkas Sheet Siswa</span>
                    <span className="text-xs text-slate-500">Mendukung format: <strong>.xlsx (Microsoft Excel)</strong>, <strong>.xls</strong>, atau <strong>.csv</strong></span>
                  </div>

                  {uploadedFileName && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-medium text-xs">
                      <i className="bi bi-file-earmark-check"></i>
                      <span>Berkas: {uploadedFileName}</span>
                    </div>
                  )}

                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-emerald-600/20 transition-all">
                      <i className="bi bi-folder2-open"></i>
                      <span>Buka Berkas Excel / Sheet Komputer</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Method 2: Copy-Paste */}
              {importTab === 'paste' && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">
                    Tempel 4 Kolom (NISN, Nama Siswa, Tanggal Lahir, Kelas):
                  </label>
                  <textarea
                    rows={6}
                    placeholder={`0081234561\tAhmad Rizky Pratama\t2009-05-14\tVII.2\n0081234562\tBella Anindya Putri\t2009-08-22\tVII.2\n0081234563\tDimas Satria Wijaya\t2009-01-30\tVII.2`}
                    value={pasteContent}
                    onChange={(e) => {
                      setPasteContent(e.target.value);
                      parseRawStudentText(e.target.value);
                    }}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Buka Excel atau Google Sheets Anda, blok 4 kolom (NISN, Nama Siswa, Tanggal Lahir, Kelas), tekan <strong>Ctrl+C</strong>, lalu tekan <strong>Ctrl+V</strong> di kotak atas.
                  </p>
                </div>
              )}

              {/* Preview Table of Extracted Students */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <i className="bi bi-check2-circle text-emerald-600 text-sm"></i>
                      Hasil Pembacaan Sheet: <strong className="text-emerald-700">{parsedPreview.length} Siswa</strong> Siap Diimpor
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Periksa data sebelum menyimpan
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="px-3 py-2 w-10 text-center">No</th>
                          <th className="px-3 py-2">Kolom 1: NISN</th>
                          <th className="px-4 py-2">Kolom 2: Nama Siswa</th>
                          <th className="px-4 py-2">Kolom 3: Tanggal Lahir</th>
                          <th className="px-3 py-2">Kolom 4: Kelas</th>
                          <th className="px-3 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedPreview.map((item, idx) => {
                          const existing = students.find(s => s.nisn === item.nisn);
                          const isAlreadyRegistered = Boolean(existing);
                          const isBirthDateUpdated = existing && existing.birth_date !== item.birth_date;

                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-mono text-slate-400 text-center">{idx + 1}</td>
                              <td className="px-3 py-2 font-mono font-bold text-slate-800">{item.nisn}</td>
                              <td className="px-4 py-2 font-bold text-slate-900">{item.name}</td>
                              <td className="px-4 py-2 font-mono font-semibold text-amber-800">
                                <div>{item.birth_date}</div>
                                <div className="text-[10px] text-slate-500 font-sans font-normal">{formatDateIndonesian(item.birth_date)}</div>
                              </td>
                              <td className="px-3 py-2">
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono">
                                  {item.class_name}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isAlreadyRegistered ? (
                                  isBirthDateUpdated ? (
                                    <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                                      <i className="bi bi-arrow-repeat text-blue-600"></i>
                                      Update Tgl Lahir
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
                                      Sudah Terdaftar
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                                    + Siswa Baru
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
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isImporting || parsedPreview.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin"></i>
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle text-base"></i>
                    <span>Simpan {parsedPreview.length} Siswa ke Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
