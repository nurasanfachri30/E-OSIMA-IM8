-- ============================================================================
-- eOSIS - Skrip Inisialisasi Database Supabase Lengkap
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Tabel Settings (Pengaturan Aplikasi & Sekolah)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'app_settings',
    school_name TEXT NOT NULL DEFAULT 'SMA Negeri 1 Prestasi Bangsa',
    election_period TEXT NOT NULL DEFAULT 'Periode 2026/2027',
    school_logo_url TEXT DEFAULT '',
    is_voting_open BOOLEAN NOT NULL DEFAULT true,
    voting_start_time TIMESTAMPTZ,
    voting_end_time TIMESTAMPTZ,
    admin_username TEXT NOT NULL DEFAULT 'admin',
    admin_password_hash TEXT NOT NULL DEFAULT '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', -- SHA-256 dari 'admin'
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings jika belum ada
INSERT INTO public.settings (id, school_name, election_period, admin_username, admin_password_hash)
VALUES ('app_settings', 'SMA Negeri 1 Prestasi Bangsa', 'Periode 2026/2027', 'admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918')
ON CONFLICT (id) DO NOTHING;

-- 2. Tabel Classes (Kelas)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    level TEXT NOT NULL, -- Contoh: 'X', 'XI', 'XII' atau '7', '8', '9'
    major TEXT,          -- Contoh: 'IPA', 'IPS', 'RPL', 'Umum'
    homeroom_teacher TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel Students (Siswa / DPT)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    class_name TEXT NOT NULL,
    gender VARCHAR(10) DEFAULT 'Laki-laki',
    has_voted BOOLEAN NOT NULL DEFAULT false,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabel Candidates (Calon Kandidat Paslon Ketua & Wakil OSIS)
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_number INT NOT NULL UNIQUE,
    chairman_name TEXT NOT NULL,
    vice_chairman_name TEXT NOT NULL,
    photo_url TEXT,
    vision TEXT NOT NULL,
    mission TEXT NOT NULL,
    slogan TEXT,
    vote_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabel Votes (Rekap Suara Rahasia - Menjaga Azas LUBER JURDIL)
-- Tidak menyimpan id siswa secara terhubung agar pilihan tetap RAHASIA
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Trigger / Stored Procedure (RPC) untuk Voting Aman & Atomik
-- Memastikan 1 Siswa hanya 1 Suara, divalidasi di server / database!
CREATE OR REPLACE FUNCTION public.cast_vote(
    p_student_id UUID,
    p_candidate_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_has_voted BOOLEAN;
    v_is_voting_open BOOLEAN;
    v_candidate_exists BOOLEAN;
BEGIN
    -- 1. Cek apakah voting sedang dibuka
    SELECT is_voting_open INTO v_is_voting_open FROM public.settings WHERE id = 'app_settings';
    IF v_is_voting_open IS NOT NULL AND v_is_voting_open = false THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pemilihan sedang ditutup oleh panitia.');
    END IF;

    -- 2. Cek apakah kandidat valid
    SELECT EXISTS (SELECT 1 FROM public.candidates WHERE id = p_candidate_id) INTO v_candidate_exists;
    IF NOT v_candidate_exists THEN
        RETURN jsonb_build_object('success', false, 'message', 'Kandidat tidak ditemukan.');
    END IF;

    -- 3. Cek status hak suara siswa dengan lock FOR UPDATE untuk cegah race condition
    SELECT has_voted INTO v_has_voted FROM public.students WHERE id = p_student_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Data siswa tidak terdaftar.');
    END IF;

    IF v_has_voted THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda sudah menggunakan hak suara!');
    END IF;

    -- 4. Update status siswa menjadi sudah memilih
    UPDATE public.students 
    SET has_voted = true, voted_at = now()
    WHERE id = p_student_id;

    -- 5. Tambah perolehan suara kandidat
    UPDATE public.candidates
    SET vote_count = vote_count + 1
    WHERE id = p_candidate_id;

    -- 6. Catat riwayat suara anonim
    INSERT INTO public.votes (candidate_id) VALUES (p_candidate_id);

    RETURN jsonb_build_object('success', true, 'message', 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi.');
END;
$$;

-- 7. Reset Voting Function (Fitur Admin untuk reset simulasi)
CREATE OR REPLACE FUNCTION public.reset_all_votes()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.students SET has_voted = false, voted_at = NULL;
    UPDATE public.candidates SET vote_count = 0;
    DELETE FROM public.votes;
    RETURN jsonb_build_object('success', true, 'message', 'Seluruh data suara berhasil direset.');
END;
$$;

-- 8. Aturan Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Policy untuk public / anon
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public update settings" ON public.settings;
CREATE POLICY "Public update settings" ON public.settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read classes" ON public.classes;
CREATE POLICY "Public read classes" ON public.classes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage classes" ON public.classes;
CREATE POLICY "Public manage classes" ON public.classes FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read students" ON public.students;
CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage students" ON public.students;
CREATE POLICY "Public manage students" ON public.students FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read candidates" ON public.candidates;
CREATE POLICY "Public read candidates" ON public.candidates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage candidates" ON public.candidates;
CREATE POLICY "Public manage candidates" ON public.candidates FOR ALL USING (true);

DROP POLICY IF EXISTS "Public insert votes" ON public.votes;
CREATE POLICY "Public insert votes" ON public.votes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public read votes count" ON public.votes;
CREATE POLICY "Public read votes count" ON public.votes FOR SELECT USING (true);

-- 9. Storage Buckets (Optional jika bucket storage dipakai)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('eosis-assets', 'eosis-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Storage" ON storage.objects;
CREATE POLICY "Public Access Storage" ON storage.objects
FOR ALL USING (bucket_id = 'eosis-assets')
WITH CHECK (bucket_id = 'eosis-assets');

-- 10. Data Awal Contoh (Seed Data)
INSERT INTO public.classes (name, level, major, homeroom_teacher) VALUES
('X MIPA 1', 'X', 'MIPA', 'Budi Santoso, S.Pd'),
('X MIPA 2', 'X', 'MIPA', 'Ratna Dewi, M.Pd'),
('XI IPS 1', 'XI', 'IPS', 'Ahmad Fadillah, S.Pd'),
('XII MIPA 1', 'XII', 'MIPA', 'Siti Rahmawati, S.Pd')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.students (nisn, name, birth_date, class_name, gender) VALUES
('0071234561', 'Ahmad Rizky Pratama', '2008-05-14', 'X MIPA 1', 'Laki-laki'),
('0071234562', 'Bella Anindya Putri', '2008-08-22', 'X MIPA 1', 'Perempuan'),
('0071234563', 'Dimas Satria Wijaya', '2008-01-30', 'X MIPA 2', 'Laki-laki'),
('0071234564', 'Eka Nur Halizah', '2007-11-19', 'XI IPS 1', 'Perempuan'),
('0071234565', 'Fajar Ramadhan', '2006-03-25', 'XII MIPA 1', 'Laki-laki'),
('0071234566', 'Gita Permata Sari', '2006-09-08', 'XII MIPA 1', 'Perempuan')
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO public.candidates (candidate_number, chairman_name, vice_chairman_name, photo_url, slogan, vision, mission) VALUES
(1, 'Arkan Danendra', 'Nabila Zahra', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'Bersatu Membangun OSIS Berprestasi, Berkarakter, dan Berdaya Saing Global', 'Mewujudkan OSIS sebagai wadah aspirasi siswa yang inklusif, inovatif, dan berakhlak mulia di era digital.', '1. Menumbuhkan nilai keagamaan dan budi pekerti luhur.\n2. Mengoptimalkan kegiatan ekstrakurikuler berbasis talenta dan teknologi.\n3. Membuka forum aspirasi siswa secara terbuka dan responsif.\n4. Memperkuat sinergi antara siswa, guru, dan organisasi sekolah.'),
(2, 'Muhammad Rayhan', 'Clarissa Aurelia', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 'Aksi Nyata, Kreasi Bersama, Menuju Sekolah Juara', 'Menjadikan OSIS yang progresif, kolaboratif, dan solutif demi kemajuan potensi seluruh pelajar.', '1. Mengadakan festival seni, literasi, dan sains tingkat sekolah.\n2. Mengembangkan program kepedulian lingkungan dan sosial (Green School).\n3. Mendukung pengembangan kepemimpinan siswa melalui pelatihan berkala.\n4. Mewujudkan transparansi program kerja OSIS yang terukur.')
ON CONFLICT (candidate_number) DO NOTHING;
