import { SchoolProfile, User, Subject, SchoolLevel } from '../types';
import { supabase } from '../lib/supabase';

// Mock Initial Data
const INITIAL_SCHOOLS: SchoolProfile[] = [
  {
    id: 'sch_demo_1',
    name: 'SMAS DHARMA BAKTI (SMA)',
    level: SchoolLevel.SMA,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_Tut_Wuri_Handayani.png/240px-Logo_Tut_Wuri_Handayani.png',
    headmasterName: 'Drs. H. Kepala SMA, M.Pd',
    headmasterNIP: '19750101 200012 1 001',
    address: 'Jl. Pendidikan SMA No. 1'
  },
  {
    id: 'sch_demo_2',
    name: 'SMKN 1 TEKNOLOGI (SMK)',
    level: SchoolLevel.SMK,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_Tut_Wuri_Handayani.png/240px-Logo_Tut_Wuri_Handayani.png',
    headmasterName: 'Ir. Kepala SMK, M.T',
    headmasterNIP: '19800101 200512 1 002',
    address: 'Jl. Vokasi No. 5'
  },
  {
    id: 'sch_demo_3',
    name: 'SMPN 5 HARAPAN (SMP)',
    level: SchoolLevel.SMP,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_Tut_Wuri_Handayani.png/240px-Logo_Tut_Wuri_Handayani.png',
    headmasterName: 'Dra. Kepala SMP, M.Pd',
    headmasterNIP: '19850101 201012 2 003',
    address: 'Jl. Menengah No. 3'
  }
];

const INITIAL_USERS: User[] = [
  { username: 'admin', role: 'admin', name: 'Administrator' },
  { username: 'guru', role: 'user', name: 'Guru Mapel' }
];

// Universal Subjects + Specific Ones
const INITIAL_SUBJECTS: Subject[] = [
  // UMUM (All Levels)
  { id: 'sub_1', name: 'Bahasa Indonesia', levels: [SchoolLevel.SMP, SchoolLevel.SMA, SchoolLevel.SMK] },
  { id: 'sub_2', name: 'Bahasa Inggris', levels: [SchoolLevel.SMP, SchoolLevel.SMA, SchoolLevel.SMK] },
  { id: 'sub_3', name: 'Pendidikan Agama & Budi Pekerti', levels: [SchoolLevel.SMP, SchoolLevel.SMA, SchoolLevel.SMK] },
  { id: 'sub_4', name: 'PPKn', levels: [SchoolLevel.SMP, SchoolLevel.SMA, SchoolLevel.SMK] },
  
  // SMP Specific
  { id: 'sub_smp_1', name: 'Ilmu Pengetahuan Alam (IPA)', levels: [SchoolLevel.SMP] },
  { id: 'sub_smp_2', name: 'Ilmu Pengetahuan Sosial (IPS)', levels: [SchoolLevel.SMP] },
  
  // SMA Specific
  { id: 'sub_sma_1', name: 'Matematika Wajib', levels: [SchoolLevel.SMA, SchoolLevel.SMK] },
  { id: 'sub_sma_2', name: 'Fisika', levels: [SchoolLevel.SMA] },
  { id: 'sub_sma_3', name: 'Kimia', levels: [SchoolLevel.SMA] },
  { id: 'sub_sma_4', name: 'Biologi', levels: [SchoolLevel.SMA] },
  { id: 'sub_sma_5', name: 'Geografi', levels: [SchoolLevel.SMA] },
  { id: 'sub_sma_6', name: 'Sosiologi', levels: [SchoolLevel.SMA] },
  { id: 'sub_sma_7', name: 'Ekonomi', levels: [SchoolLevel.SMA] },
  { id: 'sub_sma_8', name: 'Sejarah', levels: [SchoolLevel.SMA, SchoolLevel.SMK] },

  // SMK Specific (Vocational)
  { id: 'sub_smk_1', name: 'Dasar Program Keahlian (TKJ/RPL)', levels: [SchoolLevel.SMK] },
  { id: 'sub_smk_2', name: 'Produk Kreatif & Kewirausahaan', levels: [SchoolLevel.SMK] },
  { id: 'sub_smk_3', name: 'Akuntansi Dasar', levels: [SchoolLevel.SMK] },
  { id: 'sub_smk_4', name: 'Administrasi Umum', levels: [SchoolLevel.SMK] },
  { id: 'sub_smk_5', name: 'Informatika', levels: [SchoolLevel.SMA, SchoolLevel.SMK, SchoolLevel.SMP] },
];

export const storageService = {
  // --- SCHOOLS ---
  getSchools: async (): Promise<SchoolProfile[]> => {
    if (supabase) {
      try {
        const { data } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            level: d.level || SchoolLevel.SMA, // Default for migration
            logoUrl: d.logo_url,
            headmasterName: d.headmaster_name,
            headmasterNIP: d.headmaster_nip,
            address: d.address
          }));
        }
      } catch (err) { console.warn("DB Fetch failed", err); }
    }
    const stored = localStorage.getItem('app_schools');
    return stored ? JSON.parse(stored) : INITIAL_SCHOOLS;
  },

  saveSchool: async (school: SchoolProfile): Promise<void> => {
    if (supabase) {
      try {
        const dbPayload = {
          name: school.name,
          level: school.level,
          logo_url: school.logoUrl,
          headmaster_name: school.headmasterName,
          headmaster_nip: school.headmasterNIP,
          address: school.address
        };
        if (school.id && !school.id.startsWith('sch_')) {
          await supabase.from('schools').update(dbPayload).eq('id', school.id);
        } else {
          await supabase.from('schools').insert([dbPayload]);
        }
      } catch (err) { console.error("DB Save failed", err); }
    }
    const schools = await storageService.getLocalSchools(); 
    const index = schools.findIndex(s => s.id === school.id);
    if (index >= 0) schools[index] = school;
    else schools.push({ ...school, id: school.id || `sch_${Date.now()}` });
    localStorage.setItem('app_schools', JSON.stringify(schools));
  },

  deleteSchool: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('schools').delete().eq('id', id);
    const schools = await storageService.getLocalSchools();
    localStorage.setItem('app_schools', JSON.stringify(schools.filter(s => s.id !== id)));
  },

  getLocalSchools: async (): Promise<SchoolProfile[]> => {
    const stored = localStorage.getItem('app_schools');
    return stored ? JSON.parse(stored) : INITIAL_SCHOOLS;
  },

  // --- SUBJECTS (MATA PELAJARAN) ---
  getSubjects: async (): Promise<Subject[]> => {
    if (supabase) {
      try {
        const { data } = await supabase.from('subjects').select('*').order('name');
        if (data && data.length > 0) return data.map((s:any) => ({
          id: s.id,
          name: s.name,
          levels: s.levels || [SchoolLevel.SMA] // Default migration
        }));
      } catch (e) { console.warn(e); }
    }
    const stored = localStorage.getItem('app_subjects');
    return stored ? JSON.parse(stored) : INITIAL_SUBJECTS;
  },

  saveSubject: async (subject: Subject): Promise<void> => {
    if (supabase) {
      try {
        const payload = { name: subject.name, levels: subject.levels };
        if (subject.id && !subject.id.startsWith('sub_')) {
           await supabase.from('subjects').update(payload).eq('id', subject.id);
        } else {
           await supabase.from('subjects').insert([payload]);
        }
      } catch (e) { console.error(e); }
    }
    const subjects = await storageService.getLocalSubjects();
    const index = subjects.findIndex(s => s.id === subject.id);
    if (index >= 0) subjects[index] = subject;
    else subjects.push({ ...subject, id: subject.id || `sub_${Date.now()}` });
    localStorage.setItem('app_subjects', JSON.stringify(subjects));
  },

  deleteSubject: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('subjects').delete().eq('id', id);
    const subjects = await storageService.getLocalSubjects();
    localStorage.setItem('app_subjects', JSON.stringify(subjects.filter(s => s.id !== id)));
  },

  getLocalSubjects: async (): Promise<Subject[]> => {
    const stored = localStorage.getItem('app_subjects');
    return stored ? JSON.parse(stored) : INITIAL_SUBJECTS;
  },

  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    if (supabase) {
      try {
        const { data } = await supabase.from('app_users').select('*').eq('role', 'user');
        if (data) return data.map((u: any) => ({ username: u.username, role: u.role, name: u.name }));
      } catch (e) { console.warn(e); }
    }
    const stored = localStorage.getItem('app_users_list');
    return stored ? JSON.parse(stored) : INITIAL_USERS.filter(u => u.role === 'user');
  },

  saveUser: async (user: User & { password?: string }): Promise<void> => {
    if (supabase) {
      try {
        const payload: any = { username: user.username, role: user.role, name: user.name };
        if (user.password) payload.password = user.password;
        await supabase.from('app_users').upsert(payload);
      } catch (e) { console.error(e); }
    }
    const users = await storageService.getLocalUsers();
    const index = users.findIndex(u => u.username === user.username);
    if (index >= 0) users[index] = { ...users[index], ...user };
    else users.push(user);
    localStorage.setItem('app_users_list', JSON.stringify(users));
  },

  deleteUser: async (username: string): Promise<void> => {
    if (supabase) await supabase.from('app_users').delete().eq('username', username);
    const users = await storageService.getLocalUsers();
    localStorage.setItem('app_users_list', JSON.stringify(users.filter(u => u.username !== username)));
  },

  getLocalUsers: async (): Promise<User[]> => {
    const stored = localStorage.getItem('app_users_list');
    return stored ? JSON.parse(stored) : INITIAL_USERS;
  },

  // --- AUTH ---
  login: async (username: string, password: string): Promise<User | null> => {
    // Mock Auth Local
    if (username === 'admin' && password === 'admin123') return { username: 'admin', role: 'admin', name: 'Administrator (Local)' };
    if (username === 'guru' && password === 'guru123') return { username: 'guru', role: 'user', name: 'Guru Pengguna (Local)' };
    
    // Supabase Auth (Optional Check)
    if (supabase) {
      try {
        const { data } = await supabase.from('app_users').select('*').eq('username', username).eq('password', password).single();
        if (data) return { username: data.username, role: data.role, name: data.name };
      } catch (e) {}
    }
    
    const localUsers = await storageService.getLocalUsers();
    const found = localUsers.find(u => u.username === username); 
    if (found) return found; // Note: In a real app, verify password hash here.

    return null;
  },

  getUserSession: (): User | null => {
    const stored = localStorage.getItem('app_user_session');
    return stored ? JSON.parse(stored) : null;
  },
  setUserSession: (user: User) => localStorage.setItem('app_user_session', JSON.stringify(user)),
  clearUserSession: () => localStorage.removeItem('app_user_session')
};