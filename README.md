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
    Di bagian "Environment Variables", kamu wajib memasukkan kunci rahasia agar aplikasi bisa berjalan.
    
    *   **Name**: `API_KEY`
    *   **Value**: `(Copy paste API Key Gemini AI kamu di sini)`
    
    *Jika menggunakan Supabase (Opsional):*
    *   **Name**: `SUPABASE_URL` -> **Value**: `(URL Project Supabase)`
    *   **Name**: `SUPABASE_KEY` -> **Value**: `(Anon Public Key Supabase)`

4.  **Klik Deploy**
    *   Tunggu proses build selesai (sekitar 1-2 menit).
    *   Setelah selesai, Vercel akan memberikan link domain (contoh: `aplikasi-soal-pro.vercel.app`).
    *   Aplikasi kamu sudah online!

---

## 🛠 Setup Database (Opsional - Supabase)

Jika kamu ingin fitur **Simpan Data Sekolah & Guru** permanen (tidak hilang saat refresh), kamu perlu menghubungkan aplikasi ke Supabase.

### 1. Environment Variables Local
Buat file `.env` di komputer kamu untuk testing lokal:

```env
# Google Gemini API Key (Wajib)
API_KEY=masukkan_api_key_disini

# Database (Opsional - Jika kosong, app jalan mode LocalStorage/Offline)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-public-anon-key
```

### 2. Skema Database (SQL)
Jalankan query ini di **SQL Editor** pada Dashboard Supabase kamu:

#### A. Tabel `schools`
```sql
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
```

#### B. Tabel `subjects`
```sql
CREATE TABLE public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    levels TEXT[] NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### C. Tabel `app_users`
```sql
CREATE TABLE public.app_users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Akun Default
INSERT INTO public.app_users (username, password, name, role)
VALUES 
('admin', 'admin123', 'Administrator', 'admin'),
('guru', 'guru123', 'Guru Mapel', 'user');
```

---

## 💻 Cara Menjalankan di Komputer (Local)

1.  **Install Dependencies**
    ```bash
    npm install
    ```
2.  **Jalankan Server**
    ```bash
    npm start
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Troubleshooting

*   **Error: API Key Missing**: Pastikan kamu sudah memasukkan `API_KEY` di Environment Variables Vercel.
*   **Halaman Putih saat Deploy**: Cek "Logs" di dashboard Vercel. Biasanya karena ada error kodingan atau build script yang salah.
*   **Gambar Logo Tidak Muncul di PDF**: Pastikan URL gambar logo mendukung CORS (bisa diakses publik) atau gunakan link gambar dari Wikipedia/Imgur.
