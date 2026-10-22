import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Candidate,
  ClassItem,
  SchoolSettings,
  Student,
  UserRole,
  AdminActiveTab
} from '../types';
import {
  initialCandidates,
  initialClasses,
  initialSettings,
  initialStudents
} from '../data/initialData';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { sha256 } from '../lib/crypto';
import { normalizeDateToYMD, isDateMatching } from '../lib/dateUtils';

interface ElectionContextType {
  settings: SchoolSettings;
  classes: ClassItem[];
  students: Student[];
  candidates: Candidate[];
  currentRole: UserRole;
  currentStudent: Student | null;
  isAdminAuthenticated: boolean;
  adminActiveTab: AdminActiveTab;
  isDatabaseLive: boolean;
  isLoading: boolean;
  tableDetails: { [key: string]: boolean };
  
  // Navigation & Auth
  setCurrentRole: (role: UserRole) => void;
  setAdminActiveTab: (tab: AdminActiveTab) => void;
  loginStudent: (nisn: string, birthDate: string) => Promise<{ success: boolean; message: string }>;
  logoutStudent: () => void;
  loginAdmin: (username: string, passwordPlain: string) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => void;
  
  // Voting
  castVote: (candidateId: string) => Promise<{ success: boolean; message: string }>;
  
  // Data actions
  updateSettings: (newSettings: Partial<SchoolSettings>) => Promise<boolean>;
  addClass: (cls: Omit<ClassItem, 'id'>) => Promise<boolean>;
  updateClass: (id: string, cls: Partial<ClassItem>) => Promise<boolean>;
  deleteClass: (id: string) => Promise<boolean>;
  
  addStudent: (stu: Omit<Student, 'id' | 'has_voted' | 'voted_at'>) => Promise<boolean>;
  updateStudent: (id: string, stu: Partial<Student>) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  resetStudentVote: (id: string) => Promise<boolean>;
  importStudents: (
    studentsList: Array<{ nisn: string; name: string; class_name: string; birth_date?: string; gender?: 'Laki-laki' | 'Perempuan' }>
  ) => Promise<{ success: boolean; count: number; message: string }>;
  
  addCandidate: (can: Omit<Candidate, 'id' | 'vote_count'>) => Promise<boolean>;
  updateCandidate: (id: string, can: Partial<Candidate>) => Promise<boolean>;
  deleteCandidate: (id: string) => Promise<boolean>;
  
  resetAllVotes: () => Promise<boolean>;
  refreshAllData: () => Promise<void>;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'eosis_settings_v1',
  CLASSES: 'eosis_classes_v1',
  STUDENTS: 'eosis_students_v1',
  CANDIDATES: 'eosis_candidates_v1',
  STUDENT_SESSION: 'eosis_student_session_v1',
  ADMIN_SESSION: 'eosis_admin_session_v1',
};

export const ElectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    return saved ? JSON.parse(saved) : initialCandidates;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminActiveTab, setAdminActiveTab] = useState<AdminActiveTab>('beranda');

  const [isDatabaseLive, setIsDatabaseLive] = useState<boolean>(false);
  const [tableDetails, setTableDetails] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }, [candidates]);

  // Check Supabase connection and fetch live data
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const conn = await checkSupabaseConnection();
      setIsDatabaseLive(conn.tablesReady);
      setTableDetails(conn.details);

      if (conn.tablesReady) {
        // Fetch Settings
        const { data: settData } = await supabase.from('settings').select('*').limit(1).maybeSingle();
        if (settData) {
          setSettings(prev => ({ ...prev, ...settData }));
        }

        // Fetch Classes
        const { data: clsData } = await supabase.from('classes').select('*').order('name', { ascending: true });
        if (clsData) {
          setClasses(clsData);
        }

        // Fetch Students
        const { data: stuData } = await supabase.from('students').select('*').order('name', { ascending: true });
        if (stuData) {
          setStudents(stuData);
        }

        // Fetch Candidates
        const { data: canData } = await supabase.from('candidates').select('*').order('candidate_number', { ascending: true });
        if (canData) {
          setCandidates(canData);
        }
      }
    } catch (err) {
      console.warn('Supabase fetch error, using local storage state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Restore sessions on mount
  useEffect(() => {
    const savedAdmin = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (savedAdmin === 'true') {
      setIsAdminAuthenticated(true);
      setCurrentRole('admin');
    }

    const savedStudentStr = sessionStorage.getItem(STORAGE_KEYS.STUDENT_SESSION);
    if (savedStudentStr) {
      try {
        const parsed = JSON.parse(savedStudentStr);
        setCurrentStudent(parsed);
        setCurrentRole('student');
      } catch {
        sessionStorage.removeItem(STORAGE_KEYS.STUDENT_SESSION);
      }
    }

    refreshAllData();
  }, [refreshAllData]);

  // Keep currentStudent in sync with students array if updated
  useEffect(() => {
    if (currentStudent) {
      const found = students.find(s => s.id === currentStudent.id || s.nisn === currentStudent.nisn);
      if (found) {
        setCurrentStudent(found);
        sessionStorage.setItem(STORAGE_KEYS.STUDENT_SESSION, JSON.stringify(found));
      }
    }
  }, [students, currentStudent]);

  // --- Auth: Student Login ---
  const loginStudent = async (nisn: string, birthDate: string) => {
    const cleanNisn = nisn.trim();
    const cleanDate = normalizeDateToYMD(birthDate.trim());

    if (!cleanNisn || !cleanDate) {
      return { success: false, message: 'Harap isi NISN dan tanggal lahir secara lengkap.' };
    }

    let studentRecord: Student | null = null;

    if (isDatabaseLive) {
      try {
        // Query by NISN first to provide targeted, informative feedback
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('nisn', cleanNisn)
          .maybeSingle();

        if (error) {
          console.error('Supabase student login query error:', error);
        } else if (data) {
          if (isDateMatching(data.birth_date, cleanDate)) {
            studentRecord = data;
          } else {
            return {
              success: false,
              message: `Tanggal lahir yang dimasukkan tidak cocok dengan data NISN ${cleanNisn}. Pastikan tanggal lahir sesuai data sekolah.`,
            };
          }
        }
      } catch (e) {
        console.error('Live DB query error:', e);
      }
    }

    // Fallback to local students if not found in DB or DB offline
    if (!studentRecord) {
      const match = students.find(s => s.nisn === cleanNisn);
      if (match) {
        if (isDateMatching(match.birth_date, cleanDate)) {
          studentRecord = match;
        } else {
          return {
            success: false,
            message: `Tanggal lahir yang dimasukkan tidak cocok dengan data NISN ${cleanNisn}. Pastikan tanggal lahir sesuai data sekolah.`,
          };
        }
      }
    }

    if (!studentRecord) {
      return {
        success: false,
        message: `NISN "${cleanNisn}" tidak terdaftar dalam Daftar Pemilih Tetap (DPT). Silakan periksa kembali atau hubungi panitia.`,
      };
    }

    setCurrentStudent(studentRecord);
    setCurrentRole('student');
    sessionStorage.setItem(STORAGE_KEYS.STUDENT_SESSION, JSON.stringify(studentRecord));

    return {
      success: true,
      message: `Selamat datang, ${studentRecord.name}!`,
    };
  };


  const logoutStudent = () => {
    sessionStorage.removeItem(STORAGE_KEYS.STUDENT_SESSION);
    setCurrentStudent(null);
    setCurrentRole('guest');
  };

  // --- Auth: Admin Login ---
  const loginAdmin = async (username: string, passwordPlain: string) => {
    const cleanUser = username.trim();
    if (!cleanUser || !passwordPlain) {
      return { success: false, message: 'Harap isi username dan password admin.' };
    }

    const hashedInput = await sha256(passwordPlain);

    // Check credentials against settings
    let targetUsername = settings.admin_username;
    let targetPasswordHash = settings.admin_password_hash;

    if (isDatabaseLive) {
      try {
        const { data } = await supabase.from('settings').select('*').limit(1).maybeSingle();
        if (data) {
          targetUsername = data.admin_username || targetUsername;
          targetPasswordHash = data.admin_password_hash || targetPasswordHash;
        }
      } catch (e) {
        console.warn('Error reading admin credentials from Supabase:', e);
      }
    }

    // Strict cryptographic hash check to ensure admin password security
    const isPassValid = hashedInput === targetPasswordHash;

    if (cleanUser === targetUsername && isPassValid) {
      setIsAdminAuthenticated(true);
      setCurrentRole('admin');
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
      return { success: true, message: 'Login Administrator berhasil!' };
    }

    return { success: false, message: 'Username atau Password Administrator salah.' };
  };

  const logoutAdmin = () => {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    setIsAdminAuthenticated(false);
    setCurrentRole('guest');
    setAdminActiveTab('beranda');
  };

  // --- Voting RPC / Atomic Cast Vote ---
  const castVote = async (candidateId: string) => {
    if (!currentStudent) {
      return { success: false, message: 'Sesi pemilih tidak ditemukan. Silakan login kembali.' };
    }

    if (!settings.is_voting_open) {
      return { success: false, message: 'Pemilihan suara sedang ditutup oleh panitia.' };
    }

    // Verify candidate exists
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return { success: false, message: 'Kandidat yang dipilih tidak valid.' };
    }

    // Double check if student has already voted (Front-end check)
    if (currentStudent.has_voted) {
      return { success: false, message: 'Anda sudah menggunakan hak suara!' };
    }

    // 1. Try Supabase Stored Procedure / RPC for strict atomic validation on backend
    if (isDatabaseLive) {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('cast_vote', {
          p_student_id: currentStudent.id,
          p_candidate_id: candidateId,
        });

        if (rpcError) {
          console.warn('Supabase RPC cast_vote failed, falling back to direct table update:', rpcError);
          // If RPC is missing, attempt direct table update
          const { error: studentUpdateErr } = await supabase
            .from('students')
            .update({ has_voted: true, voted_at: new Date().toISOString() })
            .eq('id', currentStudent.id)
            .eq('has_voted', false);

          if (studentUpdateErr) {
            return { success: false, message: 'Gagal mencatat suara di database Supabase.' };
          }

          // Increment candidate vote
          await supabase
            .from('candidates')
            .update({ vote_count: candidate.vote_count + 1 })
            .eq('id', candidateId);

          // Insert anonymous vote
          await supabase.from('votes').insert([{ candidate_id: candidateId }]);
        } else if (rpcData && rpcData.success === false) {
          return { success: false, message: rpcData.message || 'Gagal memberikan suara.' };
        }
      } catch (err) {
        console.error('Error during Supabase vote:', err);
      }
    }

    // 2. Update local state & storage atomically
    const votedTime = new Date().toISOString();

    setStudents(prev =>
      prev.map(s => (s.id === currentStudent.id ? { ...s, has_voted: true, voted_at: votedTime } : s))
    );

    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, vote_count: c.vote_count + 1 } : c))
    );

    // Update current student session state
    const updatedStudent: Student = {
      ...currentStudent,
      has_voted: true,
      voted_at: votedTime,
    };
    setCurrentStudent(updatedStudent);
    sessionStorage.setItem(STORAGE_KEYS.STUDENT_SESSION, JSON.stringify(updatedStudent));

    return {
      success: true,
      message: 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi',
    };
  };

  // --- Settings Update ---
  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    const merged: SchoolSettings = {
      ...settings,
      ...newSettings,
      updated_at: new Date().toISOString(),
    };
    setSettings(merged);

    if (isDatabaseLive) {
      try {
        await supabase.from('settings').upsert({
          ...merged,
          id: 'app_settings',
        });
      } catch (e) {
        console.warn('Error updating settings in Supabase:', e);
      }
    }
    return true;
  };

  // --- Classes CRUD ---
  const addClass = async (cls: Omit<ClassItem, 'id'>) => {
    const newClass: ClassItem = {
      ...cls,
      id: isDatabaseLive ? crypto.randomUUID() : `cls-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setClasses(prev => [...prev, newClass]);

    if (isDatabaseLive) {
      try {
        await supabase.from('classes').insert([newClass]);
      } catch (e) {
        console.error('Error inserting class to Supabase:', e);
      }
    }
    return true;
  };

  const updateClass = async (id: string, cls: Partial<ClassItem>) => {
    setClasses(prev => prev.map(c => (c.id === id ? { ...c, ...cls } : c)));

    if (isDatabaseLive) {
      try {
        await supabase.from('classes').update(cls).eq('id', id);
      } catch (e) {
        console.error('Error updating class in Supabase:', e);
      }
    }
    return true;
  };

  const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  const deleteClass = async (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));

    if (isDatabaseLive && isUuid(id)) {
      try {
        await supabase.from('classes').delete().eq('id', id);
      } catch (e) {
        console.error('Error deleting class in Supabase:', e);
      }
    }
    return true;
  };

  // --- Students CRUD ---
  const addStudent = async (stu: Omit<Student, 'id' | 'has_voted' | 'voted_at'>) => {
    // Check if NISN already exists
    if (students.some(s => s.nisn === stu.nisn)) {
      return false;
    }

    let assignedId = crypto.randomUUID();
    const cleanBirth = normalizeDateToYMD(stu.birth_date) || '2008-01-01';

    if (isDatabaseLive) {
      try {
        const { data, error } = await supabase.from('students').insert([{
          nisn: stu.nisn,
          name: stu.name,
          birth_date: cleanBirth,
          class_name: stu.class_name,
          gender: stu.gender || 'Laki-laki',
          has_voted: false
        }]).select().single();

        if (error) {
          console.error('Error inserting student to Supabase:', error);
        } else if (data?.id) {
          assignedId = data.id;
        }
      } catch (e) {
        console.error('Error inserting student to Supabase:', e);
      }
    }

    const newStudent: Student = {
      ...stu,
      birth_date: cleanBirth,
      id: assignedId,
      has_voted: false,
      created_at: new Date().toISOString(),
    };

    setStudents(prev => [...prev.filter(s => s.nisn !== stu.nisn), newStudent]);
    return true;
  };

  const updateStudent = async (id: string, stu: Partial<Student>) => {
    const payload = { ...stu };
    if (payload.birth_date) {
      payload.birth_date = normalizeDateToYMD(payload.birth_date);
    }

    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...payload } : s)));

    if (isDatabaseLive && isUuid(id)) {
      try {
        const { error } = await supabase.from('students').update(payload).eq('id', id);
        if (error) {
          console.error('Error updating student in Supabase:', error);
        }
      } catch (e) {
        console.error('Error updating student in Supabase:', e);
      }
    }
    return true;
  };

  const deleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));

    if (isDatabaseLive && isUuid(id)) {
      try {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) {
          console.error('Error deleting student in Supabase:', error);
        }
      } catch (e) {
        console.error('Error deleting student in Supabase:', e);
      }
    }
    return true;
  };

  const resetStudentVote = async (id: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, has_voted: false, voted_at: undefined } : s))
    );

    if (isDatabaseLive && isUuid(id)) {
      try {
        await supabase
          .from('students')
          .update({ has_voted: false, voted_at: null })
          .eq('id', id);
      } catch (e) {
        console.error('Error resetting student vote status in Supabase:', e);
      }
    }
    return true;
  };

  // --- Batch Import Students ---
  const importStudents = async (
    studentsList: Array<{ nisn: string; name: string; class_name: string; birth_date?: string; gender?: 'Laki-laki' | 'Perempuan' }>
  ) => {
    if (!studentsList || studentsList.length === 0) {
      return { success: false, count: 0, message: 'Tidak ada data siswa untuk diimpor.' };
    }

    const existingMap = new Map<string, Student>();
    students.forEach(s => existingMap.set(s.nisn, s));

    const toInsert: Student[] = [];
    const toUpdate: Student[] = [];
    const newClassesToCreate = new Set<string>();

    for (const item of studentsList) {
      const cleanNisn = item.nisn ? item.nisn.trim() : '';
      const cleanName = item.name ? item.name.trim() : '';
      const cleanClass = item.class_name ? item.class_name.trim() : '';
      const cleanBirth = normalizeDateToYMD(item.birth_date) || '2008-01-01';

      if (!cleanNisn || !cleanName || !cleanClass) continue;

      newClassesToCreate.add(cleanClass);

      const existing = existingMap.get(cleanNisn);
      if (existing) {
        const updated: Student = {
          ...existing,
          name: cleanName,
          class_name: cleanClass,
          birth_date: cleanBirth,
          gender: item.gender || existing.gender || 'Laki-laki',
        };
        toUpdate.push(updated);
        existingMap.set(cleanNisn, updated);
      } else {
        const newStu: Student = {
          id: crypto.randomUUID(),
          nisn: cleanNisn,
          name: cleanName,
          class_name: cleanClass,
          birth_date: cleanBirth,
          gender: item.gender || 'Laki-laki',
          has_voted: false,
          created_at: new Date().toISOString()
        };
        toInsert.push(newStu);
        existingMap.set(cleanNisn, newStu);
      }
    }

    const totalProcessed = toInsert.length + toUpdate.length;
    if (totalProcessed === 0) {
      return { success: false, count: 0, message: 'Format data siswa tidak lengkap (NISN, Nama, dan Kelas wajib ada).' };
    }

    // Auto-create any new classes
    for (const clsName of newClassesToCreate) {
      if (!classes.some(c => c.name.toLowerCase() === clsName.toLowerCase())) {
        await addClass({
          name: clsName,
          level: clsName.startsWith('VII') || clsName.startsWith('7') ? 'VII' : clsName.startsWith('VIII') || clsName.startsWith('8') ? 'VIII' : clsName.startsWith('IX') || clsName.startsWith('9') ? 'IX' : 'X',
          major: '-',
          homeroom_teacher: ''
        });
      }
    }

    // Sync to Supabase
    if (isDatabaseLive) {
      try {
        // Update existing students
        for (const stu of toUpdate) {
          const { error: updateErr } = await supabase
            .from('students')
            .update({
              name: stu.name,
              birth_date: stu.birth_date,
              class_name: stu.class_name,
              gender: stu.gender
            })
            .eq('nisn', stu.nisn);

          if (updateErr) {
            console.error(`Error updating student ${stu.nisn} in Supabase:`, updateErr);
          }
        }

        // Insert new students
        if (toInsert.length > 0) {
          const payload = toInsert.map(s => ({
            id: s.id,
            nisn: s.nisn,
            name: s.name,
            class_name: s.class_name,
            birth_date: s.birth_date,
            gender: s.gender,
            has_voted: false
          }));

          const { error: insertErr } = await supabase.from('students').insert(payload);
          if (insertErr) {
            console.error('Error batch inserting new students to Supabase:', insertErr);
          }
        }
      } catch (e) {
        console.error('Exception syncing students import to Supabase:', e);
      }
    }

    setStudents(Array.from(existingMap.values()));

    let message = `Berhasil mengimpor ${totalProcessed} data siswa!`;
    if (toUpdate.length > 0 && toInsert.length > 0) {
      message = `Berhasil: ${toUpdate.length} data siswa diperbarui (tanggal lahir & kelas disinkronkan), dan ${toInsert.length} siswa baru ditambahkan.`;
    } else if (toUpdate.length > 0) {
      message = `Berhasil memperbarui ${toUpdate.length} data siswa (tanggal lahir dan kelas telah disinkronkan).`;
    } else {
      message = `Berhasil menambahkan ${toInsert.length} data siswa baru ke DPT.`;
    }

    return {
      success: true,
      count: totalProcessed,
      message
    };
  };

  // --- Candidates CRUD ---
  const addCandidate = async (can: Omit<Candidate, 'id' | 'vote_count'>) => {
    if (candidates.some(c => c.candidate_number === can.candidate_number)) {
      return false;
    }

    let assignedId = crypto.randomUUID();

    if (isDatabaseLive) {
      try {
        const { data, error } = await supabase.from('candidates').insert([{
          candidate_number: Number(can.candidate_number),
          chairman_name: can.chairman_name,
          vice_chairman_name: can.vice_chairman_name,
          photo_url: can.photo_url || null,
          vision: can.vision,
          mission: can.mission,
          slogan: can.slogan || null,
          vote_count: 0
        }]).select().single();

        if (error) {
          console.error('Error inserting candidate to Supabase:', error);
        } else if (data?.id) {
          assignedId = data.id;
        }
      } catch (e) {
        console.error('Error inserting candidate to Supabase:', e);
      }
    }

    const newCandidate: Candidate = {
      ...can,
      id: assignedId,
      vote_count: 0,
      created_at: new Date().toISOString(),
    };

    setCandidates(prev => [...prev, newCandidate].sort((a, b) => a.candidate_number - b.candidate_number));
    return true;
  };

  const updateCandidate = async (id: string, can: Partial<Candidate>) => {
    setCandidates(prev =>
      prev
        .map(c => (c.id === id ? { ...c, ...can } : c))
        .sort((a, b) => a.candidate_number - b.candidate_number)
    );

    if (isDatabaseLive && isUuid(id)) {
      try {
        const { error } = await supabase.from('candidates').update(can).eq('id', id);
        if (error) {
          console.error('Error updating candidate in Supabase:', error);
        }
      } catch (e) {
        console.error('Error updating candidate in Supabase:', e);
      }
    }
    return true;
  };

  const deleteCandidate = async (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));

    if (isDatabaseLive && isUuid(id)) {
      try {
        const { error } = await supabase.from('candidates').delete().eq('id', id);
        if (error) {
          console.error('Error deleting candidate in Supabase:', error);
        }
      } catch (e) {
        console.error('Error deleting candidate in Supabase:', e);
      }
    }
    return true;
  };

  // --- Reset All Votes ---
  const resetAllVotes = async () => {
    setStudents(prev => prev.map(s => ({ ...s, has_voted: false, voted_at: undefined })));
    setCandidates(prev => prev.map(c => ({ ...c, vote_count: 0 })));

    if (isDatabaseLive) {
      try {
        const { error } = await supabase.rpc('reset_all_votes');
        if (error) {
          // fallback manual update
          await supabase.from('students').update({ has_voted: false, voted_at: null }).neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('candidates').update({ vote_count: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
      } catch (e) {
        console.error('Error resetting all votes in Supabase:', e);
      }
    }
    return true;
  };

  return (
    <ElectionContext.Provider
      value={{
        settings,
        classes,
        students,
        candidates,
        currentRole,
        currentStudent,
        isAdminAuthenticated,
        adminActiveTab,
        isDatabaseLive,
        isLoading,
        tableDetails,
        setCurrentRole,
        setAdminActiveTab,
        loginStudent,
        logoutStudent,
        loginAdmin,
        logoutAdmin,
        castVote,
        updateSettings,
        addClass,
        updateClass,
        deleteClass,
        addStudent,
        updateStudent,
        deleteStudent,
        resetStudentVote,
        importStudents,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        resetAllVotes,
        refreshAllData,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
};

export const useElection = () => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};
