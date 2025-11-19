
import { GradeLevel, Semester } from '../types';

// Helper type for indexing
type CurriculumMap = {
  [key in GradeLevel]?: {
    [key in Semester]?: string;
  };
};

export const CURRICULUM_CONTEXT: CurriculumMap = {
  // --- SMP (FASE D) ---
  [GradeLevel.VII]: {
    [Semester.GANJIL]: `
      KURIKULUM MERDEKA (FASE D - KELAS 7)
      
      FOKUS KOMPETENSI:
      1. Pemahaman Diri dan Lingkungan:
         - Interaksi antarwilayah, sosialisasi, dan pembentukan karakter.
         - Peta dan pemanfaatannya dalam kehidupan.
      2. Literasi & Numerasi Dasar:
         - Penggunaan data sederhana dalam analisis sosial/sains.
         - Teks deskripsi dan narasi (Bahasa).
    `,
    [Semester.GENAP]: `
      KURIKULUM MERDEKA (FASE D - KELAS 7)
      
      FOKUS KOMPETENSI:
      1. Keberagaman dan Persatuan:
         - Kebinekaan Indonesia, toleransi, dan gotong royong.
         - Aktivitas ekonomi manusia prasejarah hingga kini.
      2. Lingkungan Hidup:
         - Pencemaran lingkungan dan dampaknya (IPA).
         - Adaptasi makhluk hidup.
    `
  },
  [GradeLevel.VIII]: {
    [Semester.GANJIL]: `
      KURIKULUM MERDEKA (FASE D - KELAS 8)
      
      FOKUS KOMPETENSI:
      1. Sistem Organisasi Kehidupan (IPA):
         - Sel, jaringan, organ, sistem organ.
         - Sistem pencernaan dan zat aditif.
      2. Mobilitas Sosial (IPS):
         - Pluralitas masyarakat Indonesia.
         - Konflik dan integrasi.
    `,
    [Semester.GENAP]: `
      KURIKULUM MERDEKA (FASE D - KELAS 8)
      
      FOKUS KOMPETENSI:
      1. Tekanan Zat dan Getaran (IPA):
         - Tekanan zat cair, padat, gas.
         - Getaran, gelombang, dan bunyi.
      2. Perekonomian dan Kemerdekaan (IPS):
         - Perdagangan antardaerah/internasional.
         - Sejarah pergerakan kebangsaan.
    `
  },
  [GradeLevel.IX]: {
    [Semester.GANJIL]: `
      KURIKULUM MERDEKA (FASE D - KELAS 9)
      
      FOKUS KOMPETENSI:
      1. Sistem Reproduksi & Pewarisan Sifat (IPA):
         - Pembelahan sel, reproduksi manusia/tumbuhan.
         - Genetika dasar.
      2. Perubahan Sosial Budaya (IPS):
         - Globalisasi dan dampaknya.
         - Modernisasi di Indonesia.
    `,
    [Semester.GENAP]: `
      KURIKULUM MERDEKA (FASE D - KELAS 9)
      
      FOKUS KOMPETENSI:
      1. Teknologi Ramah Lingkungan (IPA):
         - Bioteknologi pangan dan lingkungan.
         - Tanah dan keberlangsungan kehidupan.
      2. Indonesia Pasca Kemerdekaan (IPS):
         - Masa Orde Baru hingga Reformasi.
         - Kerja sama ekonomi internasional.
    `
  },

  // --- SMA (FASE E & F) ---
  [GradeLevel.X]: {
    [Semester.GANJIL]: `
      KURIKULUM MERDEKA (FASE E)
      
      LINGKUP MATERI:
      1. Konsep Dasar & Penelitian:
         - Definisi, objek studi, prinsip, pendekatan.
         - Langkah-langkah penelitian ilmiah sederhana.
      2. Fenomena Geosfer (Geografi):
         - Peta, Pengindraan Jauh, SIG.
      3. Struktur Atom & Ikatan Kimia (Kimia).
      4. Virus & Keanekaragaman Hayati (Biologi).
    `,
    [Semester.GENAP]: `
      KURIKULUM MERDEKA (FASE E)
      
      LINGKUP MATERI:
      1. Dinamika Litosfer & Atmosfer:
         - Tektonisme, vulkanisme, seisme, cuaca, iklim.
      2. Energi Terbarukan (Fisika):
         - Usaha, energi, dan sumber energi alternatif.
      3. Ekosistem & Perubahan Lingkungan (Biologi).
      4. Stoikiometri Dasar (Kimia).
    `
  },
  [GradeLevel.XI]: {
    [Semester.GANJIL]: `
      KURIKULUM MERDEKA (FASE F)
      
      LINGKUP MATERI:
      1. Kompleksitas Keruangan (Geografi):
         - Posisi strategis Indonesia, Flora Fauna.
      2. Sistem Tubuh Manusia (Biologi):
         - Sel, transpor membran, sistem gerak, sirkulasi.
      3. Dinamika Gerak & Fluida (Fisika).
      4. Hidrokarbon & Termokimia (Kimia).
    `,
    [Semester.GENAP]: `
      KURIKULUM MERDEKA (FASE F)
      
      LINGKUP MATERI:
      1. Dinamika Penduduk & Mitigasi (Geografi).
      2. Sistem Pertahanan Tubuh & Hormon (Biologi).
      3. Gelombang Cahaya & Bunyi (Fisika).
      4. Laju Reaksi & Kesetimbangan (Kimia).
    `
  },
  [GradeLevel.XII]: {
    [Semester.GANJIL]: `
      KURIKULUM MERDEKA (FASE F - Lanjutan)
      
      LINGKUP MATERI:
      1. Pengembangan Wilayah (Geografi):
         - Tata ruang, interaksi desa-kota.
      2. Pertumbuhan & Perkembangan, Genetika (Biologi).
      3. Listrik Statis & Dinamis, Magnet (Fisika).
      4. Sifat Koligatif Larutan & Redoks (Kimia).
    `,
    [Semester.GENAP]: `
      KURIKULUM MERDEKA (FASE F - Lanjutan)
      
      LINGKUP MATERI:
      1. Kerjasama Negara Maju-Berkembang (Geografi).
      2. Evolusi & Bioteknologi (Biologi).
      3. Fisika Modern & Radioaktivitas (Fisika).
      4. Kimia Unsur & Makromolekul (Kimia).
    `
  }
};
