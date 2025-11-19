# Aplikasi Soal Pro - Generator Soal Ujian AI

Platform generator soal ujian berbasis AI (Gemini) untuk sekolah (SD/SMP/SMA/SMK) dengan dukungan Kurikulum Merdeka.

## Setup untuk Backend Developer

Aplikasi ini menggunakan **Supabase** sebagai database. Berikut adalah panduan untuk setup database agar fitur penyimpanan berfungsi.

### 1. Environment Variables

Buat file `.env` (atau inject variable di deployment) dengan value berikut:

```env
# Google Gemini API Key (Wajib untuk Generate Soal)
API_KEY=masukkan_api_key_disini

# Konfigurasi Database (Opsional - Jika kosong, app jalan mode Offline/LocalStorage)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-public-anon-key
```

### 2. Skema Database (SQL)

Silahkan jalankan query SQL berikut di **SQL Editor** Supabase untuk membuat tabel yang dibutuhkan.

#### A. Tabel `schools` (Profil Sekolah)
Menyimpan data identitas sekolah (Kop surat, Kepala Sekolah, NIP, dll).

```sql
CREATE TABLE public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    level TEXT NOT NULL, -- Enum: 'SMP', 'SMA', 'SMK'
    logo_url TEXT,
    headmaster_name TEXT,
    headmaster_nip TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### B. Tabel `subjects` (Mata Pelajaran)
Menyimpan daftar mapel dan filter jenjangnya.

```sql
CREATE TABLE public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    levels TEXT[] NOT NULL, -- Array, contoh: ['SMA', 'SMK']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### C. Tabel `app_users` (Autentikasi Sederhana)
Menyimpan data login user (Guru/Admin).
*Catatan: Untuk produksi, disarankan menggunakan Supabase Auth built-in, namun tabel ini mendukung logika login sederhana yang ada di frontend saat ini.*

```sql
CREATE TABLE public.app_users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL, -- Simpan hash jika memungkinkan
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin' atau 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Data Default
INSERT INTO public.app_users (username, password, name, role)
VALUES 
('admin', 'admin123', 'Administrator System', 'admin'),
('guru', 'guru123', 'Guru Mata Pelajaran', 'user');
```

### 3. Row Level Security (RLS)
Jika RLS diaktifkan di Supabase, pastikan menambahkan policy agar tabel bisa dibaca/tulis. Untuk tahap development/internal tool, bisa disable RLS atau buat policy `Enable read/write for all`.

---

## Cara Menjalankan Frontend (Local)

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Jalankan server development:
    ```bash
    npm start
    ```
