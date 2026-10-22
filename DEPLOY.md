# 🚀 Panduan Publish Online eOSIS (100% Free Tier / Gratis Selamanya)

Aplikasi **eOSIS (Sistem Pemilihan OSIS Online)** dibangun dengan arsitektur modern **React + Vite + Tailwind CSS + Supabase Database**. Anda dapat mempublikasikan aplikasi ini ke internet secara **100% GRATIS** tanpa biaya server.

---

## 📌 Mengapa Muncul Kendala di Tombol "Publish" AI Studio?
Tombol **Publish** di Google AI Studio secara default menghubungkan aplikasi ke **Google Cloud Run**.
- Google Cloud Run memerlukan akun Google Cloud dengan verifikasi kartu pembayaran untuk mengaktifkan Cloud Run API (meskipun ada kuota gratis 2 juta request/bulan).
- **Solusi Terbaik & Paling Populer untuk Sekolah di Indonesia:**
  Gunakan layanan **Free Tier 100% Gratis Tanpa Kartu Kredit** seperti **Vercel** atau **Netlify**!

---

## 🌟 Opsi 1: Deploy ke Vercel (Paling Direkomendasikan - 2 Menit)
Vercel memberikan hosting frontend gratis selamanya dengan domain HTTPS otomatis (`nama-sekolah.vercel.app`), kuota bandwidth 100 GB/bulan (sangat cukup untuk ribuan pemilih).

### Langkah-langkah:
1. **Daftar Akun Gratis di Vercel:**
   - Kunjungi [https://vercel.com/signup](https://vercel.com/signup) dan login menggunakan GitHub / Google.
2. **Import Repository:**
   - Klik **"Add New..."** &rarr; **"Project"**.
   - Pilih repository Git eOSIS ini.
3. **Pengaturan Build:**
   - *Framework Preset*: **Vite** (terdeteksi otomatis).
   - *Build Command*: `npm run build`
   - *Output Directory*: `dist`
4. **Environment Variables (Opsional, sudah ada nilai bawaan di kode):**
   - Tambahkan jika ingin menimpa:
     - `VITE_SUPABASE_URL` = `https://spalsekzgoqvvtrcrhdm.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = *(lihat di panel admin atau file src/lib/supabase.ts)*
5. **Klik "Deploy":**
   - Dalam 60 detik, website eOSIS Anda sudah online dan dapat diakses oleh seluruh siswa melalui HP atau komputer lab!

*(Catatan: File `vercel.json` sudah tersedia di repository ini sehingga navigasi dan reload halaman tidak akan mengalami 404).*

---

## ⚡ Opsi 2: Deploy ke Netlify (Drag & Drop Tanpa Perlu Coding / Git)
Jika Anda tidak ingin menggunakan Git atau terminal:

1. **Jalankan Build secara Lokal / Download folder `dist`:**
   ```bash
   npm run build
   ```
2. **Kunjungi Netlify Drop:**
   - Buka [https://app.netlify.com/drop](https://app.netlify.com/drop).
3. **Tarik dan Lepas (Drag & Drop):**
   - Tarik folder `dist` dari komputer Anda ke browser.
4. **Selesai!**
   - Netlify langsung memberikan link aktif berakhiran `.netlify.app` dengan HTTPS gratis.

---

## 🛡️ Opsi 3: Deploy ke Cloudflare Pages (Gratis Tanpa Batas Bandwidth)
1. Buka [https://pages.cloudflare.com](https://pages.cloudflare.com).
2. Sambungkan dengan repository GitHub Anda.
3. Pilih framework preset **Vite**.
4. Klik **Save and Deploy**.

---

## 🗄️ Database Supabase (100% Free Tier)
Database eOSIS menggunakan **Supabase PostgreSQL** yang berada di paket Free Tier:
- **500 MB Database Space** (cukup untuk puluhan ribu data siswa dan suara).
- **50.000 Active Users per bulan**.
- **Enkripsi Sandi Admin & Pilihan Suara Rahasia (SHA-256)**.
- Skrip SQL tabel otomatis tersedia di tombol **"Status & SQL Supabase"** di dalam aplikasi.

---

## 📱 Siap Digunakan Siswa & Panitia
Setelah publish, bagikan tautan website kepada siswa. Siswa dapat login menggunakan **NISN** dan **Tanggal Lahir** sesuai data yang telah diimpor oleh panitia OSIS.
