import { Candidate, ClassItem, SchoolSettings, Student } from '../types';

export const initialSettings: SchoolSettings = {
  id: 'app_settings',
  school_name: 'SMA Negeri 1 Prestasi Bangsa',
  election_period: 'Periode 2026/2027',
  school_logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80',
  is_voting_open: true,
  admin_username: 'admin',
  // SHA-256 hash for 'admin123'
  admin_password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
};

export const initialClasses: ClassItem[] = [
  {
    id: 'cls-1',
    name: 'X MIPA 1',
    level: 'X',
    major: 'MIPA',
    homeroom_teacher: 'Budi Santoso, S.Pd',
  },
  {
    id: 'cls-2',
    name: 'X MIPA 2',
    level: 'X',
    major: 'MIPA',
    homeroom_teacher: 'Ratna Dewi, M.Pd',
  },
  {
    id: 'cls-3',
    name: 'XI IPS 1',
    level: 'XI',
    major: 'IPS',
    homeroom_teacher: 'Ahmad Fadillah, S.Pd',
  },
  {
    id: 'cls-4',
    name: 'XI IPS 2',
    level: 'XI',
    major: 'IPS',
    homeroom_teacher: 'Nurul Hidayati, S.Si',
  },
  {
    id: 'cls-5',
    name: 'XII MIPA 1',
    level: 'XII',
    major: 'MIPA',
    homeroom_teacher: 'Drs. Hendro Wibowo',
  },
];

export const initialStudents: Student[] = [
  {
    id: 'stu-1',
    nisn: '0071234561',
    name: 'Ahmad Rizky Pratama',
    birth_date: '2008-05-14',
    class_name: 'X MIPA 1',
    gender: 'Laki-laki',
    has_voted: false,
  },
  {
    id: 'stu-2',
    nisn: '0071234562',
    name: 'Bella Anindya Putri',
    birth_date: '2008-08-22',
    class_name: 'X MIPA 1',
    gender: 'Perempuan',
    has_voted: false,
  },
  {
    id: 'stu-3',
    nisn: '0071234563',
    name: 'Dimas Satria Wijaya',
    birth_date: '2008-01-30',
    class_name: 'X MIPA 2',
    gender: 'Laki-laki',
    has_voted: false,
  },
  {
    id: 'stu-4',
    nisn: '0071234564',
    name: 'Eka Nur Halizah',
    birth_date: '2007-11-19',
    class_name: 'XI IPS 1',
    gender: 'Perempuan',
    has_voted: true,
    voted_at: '2026-10-19T08:15:20.000Z',
  },
  {
    id: 'stu-5',
    nisn: '0071234565',
    name: 'Fajar Ramadhan',
    birth_date: '2006-03-25',
    class_name: 'XII MIPA 1',
    gender: 'Laki-laki',
    has_voted: false,
  },
  {
    id: 'stu-6',
    nisn: '0071234566',
    name: 'Gita Permata Sari',
    birth_date: '2006-09-08',
    class_name: 'XII MIPA 1',
    gender: 'Perempuan',
    has_voted: true,
    voted_at: '2026-10-19T09:42:10.000Z',
  },
  {
    id: 'stu-7',
    nisn: '0071234567',
    name: 'Hafiz Maulana',
    birth_date: '2007-04-12',
    class_name: 'XI IPS 2',
    gender: 'Laki-laki',
    has_voted: false,
  },
  {
    id: 'stu-8',
    nisn: '0071234568',
    name: 'Indah Kusuma Wardani',
    birth_date: '2008-12-05',
    class_name: 'X MIPA 2',
    gender: 'Perempuan',
    has_voted: false,
  },
];

export const initialCandidates: Candidate[] = [
  {
    id: 'can-1',
    candidate_number: 1,
    chairman_name: 'Arkan Danendra',
    vice_chairman_name: 'Nabila Zahra',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    slogan: 'Bersatu Membangun OSIS Berprestasi, Berkarakter, dan Berdaya Saing Global',
    vision: 'Mewujudkan OSIS sebagai wadah aspirasi siswa yang inklusif, inovatif, transparan, dan berakhlak mulia di era transformasi digital.',
    mission: `1. Mengembangkan potensi kepemimpinan dan minat bakat siswa melalui program ekstrakurikuler unggulan.
2. Membangun forum aspirasi terbuka berbasis digital "Suara Siswa" untuk komunikasi yang cepat dan solutif.
3. Menggiatkan kampanye kepedulian lingkungan (Zero Waste School) dan toleransi antarsesama warga sekolah.
4. Menyelenggarakan festival seni, literasi, dan teknologi tahunan yang melibatkan kolaborasi lintas angkatan.`,
    vote_count: 1,
  },
  {
    id: 'can-2',
    candidate_number: 2,
    chairman_name: 'Muhammad Rayhan',
    vice_chairman_name: 'Clarissa Aurelia',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    slogan: 'Aksi Nyata, Kolaborasi Bersama, Mengantarkan Almamater Jadi Juara',
    vision: 'Menjadikan OSIS sebagai mitra strategis sekolah yang proaktif, adaptif, kreatif, dan berintegritas tinggi dalam mencetak generasi teladan.',
    mission: `1. Memperkuat sinergi antara organisasi kesiswaan, MPK, dewan guru, dan alumni berprestasi.
2. Mengadakan bimbingan belajar teman sebaya (Peer Tutoring) guna meningkatkan prestasi akademik sekolah.
3. Menciptakan iklim sekolah yang suportif terhadap kesehatan mental dan kesejahteraan siswa.
4. Mengoptimalkan publikasi media sosial OSIS secara profesional dan menginspirasi.`,
    vote_count: 1,
  },
  {
    id: 'can-3',
    candidate_number: 3,
    chairman_name: 'Zhafran Al-Farizi',
    vice_chairman_name: 'Syifa Nadira',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    slogan: 'Inovasi Tanpa Batas, Dedikasi Sepenuh Hati untuk Sekolah Tercinta',
    vision: 'Terwujudnya OSIS yang mandiri, adaptif, berjiwa kewirausahaan sosial, dan menjunjung tinggi nilai gotong royong.',
    mission: `1. Membangun platform e-mading dan kreativitas digital siswa untuk unjuk karya dan prestasi.
2. Mengadakan pelatihan soft skills, public speaking, dan entrepreneurship bagi siswa.
3. Meningkatkan rasa kepedulian sosial melalui kegiatan bakti sosial dan aksi tanggap kemanusiaan.
4. Mengawal tata kelola kegiatan OSIS yang akuntabel, transparan, dan dapat dipertanggungjawabkan.`,
    vote_count: 0,
  },
];
