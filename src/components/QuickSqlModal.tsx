import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { SUPABASE_URL } from '../lib/supabase';

interface QuickSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSqlModal: React.FC<QuickSqlModalProps> = ({ isOpen, onClose }) => {
  const { isDatabaseLive, tableDetails, refreshAllData, isLoading } = useElection();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'app_settings',
    school_name TEXT NOT NULL DEFAULT 'SMA Negeri 1 Prestasi Bangsa',
    election_period TEXT NOT NULL DEFAULT 'Periode 2026/2027',
    school_logo_url TEXT DEFAULT '',
    is_voting_open BOOLEAN NOT NULL DEFAULT true,
    admin_username TEXT NOT NULL DEFAULT 'admin',
    admin_password_hash TEXT NOT NULL DEFAULT '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    level TEXT NOT NULL,
    major TEXT,
    homeroom_teacher TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    class_name TEXT NOT NULL,
    has_voted BOOLEAN NOT NULL DEFAULT false,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.cast_vote(p_student_id UUID, p_candidate_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_has_voted BOOLEAN;
BEGIN
    SELECT has_voted INTO v_has_voted FROM public.students WHERE id = p_student_id FOR UPDATE;
    IF v_has_voted THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda sudah menggunakan hak suara!');
    END IF;
    UPDATE public.students SET has_voted = true, voted_at = now() WHERE id = p_student_id;
    UPDATE public.candidates SET vote_count = vote_count + 1 WHERE id = p_candidate_id;
    INSERT INTO public.votes (candidate_id) VALUES (p_candidate_id);
    RETURN jsonb_build_object('success', true, 'message', 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi.');
END;
$$;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public update settings" ON public.settings FOR ALL USING (true);
CREATE POLICY "Public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Public manage classes" ON public.classes FOR ALL USING (true);
CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public manage students" ON public.students FOR ALL USING (true);
CREATE POLICY "Public read candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Public manage candidates" ON public.candidates FOR ALL USING (true);
CREATE POLICY "Public insert votes" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read votes" ON public.votes FOR SELECT USING (true);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <i className="bi bi-database-check text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Integrasi Database Supabase</h3>
              <p className="text-xs text-slate-500">Koneksi & Panduan Schema SQL eOSIS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Alert */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isDatabaseLive 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <i className={`text-xl bi ${isDatabaseLive ? 'bi-check-circle-fill text-emerald-600' : 'bi-exclamation-triangle-fill text-amber-600'}`}></i>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">
                {isDatabaseLive ? 'Tabel Supabase Terhubung Aktif' : 'Tabel Supabase Belum Dibuat'}
              </h4>
              <p className="text-xs mt-1 leading-relaxed">
                {isDatabaseLive 
                  ? 'Koneksi ke instance Supabase Anda aktif dan seluruh tabel terdeteksi. Aplikasi siap digunakan secara penuh.'
                  : 'Aplikasi saat ini menggunakan Local Database terisolasi. Untuk sinkronisasi penuh ke cloud Supabase, cukup jalankan skrip SQL di bawah pada SQL Editor Supabase Anda.'
                }
              </p>
            </div>
          </div>

          {/* Database Endpoint Info */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex flex-col gap-1.5 font-mono">
            <div className="text-slate-500 font-sans font-semibold">Endpoint Project:</div>
            <div className="truncate text-slate-700 select-all">{SUPABASE_URL}</div>
          </div>

          {/* Table checklist */}
          <div>
            <h5 className="font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>Status Tabel di Database:</span>
              <button
                onClick={() => refreshAllData()}
                disabled={isLoading}
                className="text-xs text-blue-600 hover:text-blue-700 font-normal flex items-center gap-1 cursor-pointer"
              >
                <i className={`bi bi-arrow-clockwise ${isLoading ? 'animate-spin' : ''}`}></i>
                Cek Ulang
              </button>
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['settings', 'classes', 'students', 'candidates'].map((tableName) => {
                const ready = tableDetails[tableName];
                return (
                  <div key={tableName} className="border border-slate-200 rounded-lg p-2.5 flex items-center gap-2 bg-white">
                    <i className={`bi ${ready ? 'bi-check-circle-fill text-emerald-500' : 'bi-x-circle text-slate-400'}`}></i>
                    <div>
                      <div className="font-mono text-xs font-semibold text-slate-700">{tableName}</div>
                      <div className="text-[10px] text-slate-400">{ready ? 'Tersedia' : 'Belum ada'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Instructions */}
          <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-4 text-xs text-blue-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <i className="bi bi-info-circle-fill text-blue-600"></i>
              Cara Mudah Mengaktifkan Cloud Supabase (1 Menit):
            </div>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 leading-relaxed">
              <li>Buka dashboard Supabase project Anda di peramban.</li>
              <li>Pilih menu <strong>SQL Editor</strong> di sidebar kiri, lalu klik <strong>New Query</strong>.</li>
              <li>Klik tombol <strong>Salin Skrip SQL</strong> di bawah ini, lalu paste ke SQL Editor.</li>
              <li>Klik tombol <strong>Run</strong> (atau Ctrl+Enter). Tabel & function RPC akan langsung dibuat!</li>
            </ol>
          </div>

          {/* SQL Preview & Copy */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Skrip SQL Inisialisasi</span>
              <button
                onClick={copyToClipboard}
                className="btn-copy inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <i className={`bi ${copied ? 'bi-check2' : 'bi-clipboard'}`}></i>
                {copied ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-xs font-mono max-h-48 overflow-y-auto border border-slate-800 leading-relaxed select-all">
              {sqlCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
