# Aplikasi Soal Pro - Generator Soal Ujian AI

Platform generator soal ujian berbasis AI (Gemini) untuk sekolah (SD/SMP/SMA/SMK) dengan dukungan Kurikulum Merdeka. Aplikasi ini dibuat menggunakan React, Tailwind CSS, dan Google Gemini API.

---

## 🚀 Cara Online-kan Aplikasi (Deployment)

Cara termudah dan **GRATIS** untuk meng-online-kan aplikasi ini adalah menggunakan **Vercel**.

### Prasyarat
1.  Pastikan kode sumber (source code) aplikasi ini sudah di-upload ke **GitHub**.
2.  Memiliki akun [Vercel](https://vercel.com) (Login menggunakan GitHub).

### Langkah-langkah Deploy ke Vercel

1.  **Buka Vercel Dashboard**
    *   Masuk ke [vercel.com/new](https://vercel.com/new).
    *   Pilih repository GitHub aplikasi ini, lalu klik **Import**.

2.  **Konfigurasi Project**
    *   **Framework Preset**: Vercel biasanya otomatis mendeteksi (Create React App / Vite). Jika tidak, pilih **Create React App** atau **Vite** sesuai bundler yang kamu pakai.
    *   **Root Directory**: Biarkan default (`./`).

3.  **Masukkan Environment Variables (PENTING!)**
    Di bagian "Environment Variables", kamu wajib memasukkan kunci rahasia agar aplikasi bisa berjalan. Pastikan **NAMA VARIABEL** (Key) tepat dan tidak kembar.
    
    *   **Variable 1**
        *   Name: `API_KEY`
        *   Value: `(Paste API Key Gemini AI kamu)`
    
    *   **Variable 2** (Link Database)
        *   Name: `SUPABASE_URL`
        *   Value: `(Link yang https://...supabase.co)`
        *   *Tips: Ambil dari Dashboard Supabase -> Settings -> Data API -> Project URL*
    
    *   **Variable 3** (Kunci Database)
        *   Name: `SUPABASE_KEY`
        *   Value: `(Kode yang berawalan sb_publishable_...)`
        *   *Tips: Ambil dari Dashboard Supabase -> Settings -> Data API -> Publishable key*

4.  **Klik Deploy**
    *   Tunggu proses build selesai.
    *   Aplikasi kamu sudah online!

---

## ❓ Troubleshooting (Masalah Umum)

### 1. Error Vercel: "A variable with the name ... already exists"
**Penyebab:** Kamu memasukkan nama variabel yang sama dua kali (misal `SUPABASE_URL` ada dua baris).
**Solusi:**
*   Cek baris yang isinya kode panjang (`sb_publishable_...`), ubah Namanya (Key) menjadi `SUPABASE_KEY`.
*   Cek baris yang isinya link website, pastikan Namanya (Key) adalah `SUPABASE_URL`.

### 2. Error di Browser: `{"error": "requested path is invalid"}`
**Penyebab:** Kamu membuka link API Supabase secara langsung di browser.
**Solusi:** Abaikan saja. Itu normal. Link itu memang bukan untuk dibuka manusia, tapi untuk dicopy ke Environment Variables Vercel.

### 3. PDF Kosong / Terpotong
**Solusi:** Gunakan tombol "Download PDF" (Merah) untuk hasil instan. Jika ingin hasil lebih tajam, gunakan tombol "Cetak (Browser)" lalu pilih "Save as PDF" di pengaturan printer.

---

## 🛠 Setup Database (Supabase)

Agar data Sekolah, Guru, dan Mapel tersimpan online (tidak hilang saat ganti laptop), ikuti langkah ini:

### A. Buat Project & Tabel
1.  Buka [Supabase.com](https://supabase.com) -> New Project.
2.  Masuk ke menu **SQL Editor** (ikon Terminal di kiri).
3.  Copy-Paste kode SQL di bawah ini dan klik **RUN**:

```sql
-- 1. Tabel Sekolah
CREATE TABLE public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    level TEXT NOT NULL, -- 'SMP', 'SMA', 'SMK'
    logo_url TEXT,
    headmaster_name TEXT,
    headmaster_nip TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Mata Pelajaran
CREATE TABLE public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    levels TEXT[] NOT NULL, -- Array text, contoh: ['SMA', 'SMK']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel User (Guru & Admin)
CREATE TABLE public.app_users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Data Awal (Seeding)
INSERT INTO public.app_users (username, password, name, role)
VALUES 
('admin', 'admin123', 'Administrator', 'admin'),
('guru', 'guru123', 'Guru Mapel', 'user');

INSERT INTO public.subjects (name, levels)
VALUES 
('Bahasa Indonesia', ARRAY['SMP','SMA','SMK']),
('Matematika', ARRAY['SMP','SMA','SMK']),
('Bahasa Inggris', ARRAY['SMP','SMA','SMK']),
('PKK (Kewirausahaan)', ARRAY['SMK']);
```

### B. Matikan RLS (PENTING!)
Agar aplikasi bisa membaca dan menulis data tanpa setup auth yang rumit:
1.  Masuk ke menu **Table Editor** (ikon Tabel).
2.  Klik pada setiap tabel (`schools`, `subjects`, `app_users`).
3.  Lihat di pojok kanan atas tabel, jika ada tulisan **RLS Enabled** (hijau), klik lalu pilih **Disable RLS**.
4.  Lakukan untuk ketiga tabel tersebut.

### C. Ambil URL & Key
1.  Klik menu **Settings** (ikon Gerigi ⚙️) di pojok kiri bawah.
2.  Pilih **Data API** (atau API).
3.  Salin **Project URL** -> Masukkan ke Vercel sebagai `SUPABASE_URL`.
4.  Salin **Publishable Key (anon)** -> Masukkan ke Vercel sebagai `SUPABASE_KEY`.

---

## 💻 Cara Menjalankan di Komputer (Local)

1.  **Install Dependencies**
    ```bash
    npm install
    ```
2.  **Buat file .env**
    Copy file `.env.example` menjadi `.env` dan isi data kunci yang didapat dari langkah di atas.
    ```bash
    cp .env.example .env
    ```
3.  **Jalankan App**
    ```bash
    npm start
    ```
