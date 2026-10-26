export interface SchoolSettings {
  id: string;
  school_name: string;
  election_period: string;
  school_logo_url: string;
  is_voting_open: boolean;
  voting_start_time?: string;
  voting_end_time?: string;
  admin_username: string;
  admin_password_hash: string;
  updated_at?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  level: string; // e.g., 'X', 'XI', 'XII' or '7', '8', '9'
  major?: string; // e.g., 'MIPA', 'IPS', 'RPL', 'Umum'
  homeroom_teacher?: string;
  created_at?: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  class_name: string;
  has_voted: boolean;
  voted_at?: string;
  created_at?: string;
}

export interface Candidate {
  id: string;
  candidate_number: number;
  chairman_name: string;
  vice_chairman_name: string;
  photo_url?: string;
  vision: string;
  mission: string;
  slogan?: string;
  vote_count: number;
  created_at?: string;
}

export interface VoteRecord {
  id: string;
  candidate_id: string;
  created_at: string;
}

export type UserRole = 'guest' | 'student' | 'admin';

export type AdminActiveTab = 
  | 'beranda'
  | 'kelas'
  | 'siswa'
  | 'kandidat'
  | 'perolehan-suara'
  | 'pengaturan'
  | 'publish';
