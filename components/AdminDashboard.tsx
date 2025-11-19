
import React, { useState, useEffect } from 'react';
import { SchoolProfile, User, Subject, SchoolLevel } from '../types';
import { storageService } from '../services/storage';
import { 
  Trash2, Edit2, Plus, School, Save, 
  Users, Settings, GraduationCap, 
  Building2, UserCircle, Hash, MapPin, Key, XCircle,
  BookOpen, CheckSquare
} from 'lucide-react';

type Tab = 'schools' | 'teachers' | 'subjects' | 'settings';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('schools');

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[600px] font-sans text-gray-900">
      {/* SIDEBAR MENU */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
          <div className="p-4 bg-slate-50 border-b border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Menu Utama</h3>
          </div>
          <nav className="p-2 space-y-1">
            <button
              onClick={() => setActiveTab('schools')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'schools' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <School className="w-4 h-4" />
              Data Sekolah
            </button>
            
            <button
              onClick={() => setActiveTab('teachers')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'teachers' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Manajemen Guru
            </button>

            <button
              onClick={() => setActiveTab('subjects')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'subjects' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Mata Pelajaran
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'settings' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Setting Website
            </button>
          </nav>
          
          <div className="p-4 mt-4 border-t border-gray-100 bg-slate-50">
            <div className="text-xs text-gray-500 text-center">
              System by <span className="font-bold text-blue-600">VRS Space</span> <br/> (Enterprise Edition)
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1">
        {activeTab === 'schools' && <SchoolManager />}
        {activeTab === 'teachers' && <TeacherManager />}
        {activeTab === 'subjects' && <SubjectManager />}
        {activeTab === 'settings' && <WebsiteSettings />}
      </div>
    </div>
  );
};

// --- REUSABLE INPUT ---
const InputGroup = ({ label, icon: Icon, value, onChange, placeholder, required = true, type = "text", helperText = "" }: any) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-gray-400">
        <Icon className="h-5 w-5" />
      </div>
      <input
        type={type}
        className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm hover:border-gray-400 ${!required ? 'bg-gray-50' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
    {helperText && <p className="text-[10px] text-gray-500 ml-1">{helperText}</p>}
  </div>
);

// --- SCHOOL MANAGER ---
const SchoolManager: React.FC = () => {
  const [schools, setSchools] = useState<SchoolProfile[]>([]);
  const [editing, setEditing] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSchools = async () => {
    setLoading(true);
    const data = await storageService.getSchools();
    setSchools(data);
    setLoading(false);
  };
  useEffect(() => { loadSchools(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setLoading(true);
      await storageService.saveSchool(editing);
      setEditing(null);
      await loadSchools();
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus data sekolah ini?')) {
      await storageService.deleteSchool(id);
      loadSchools();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <School className="text-blue-600" /> Database Sekolah
          </h2>
          <p className="text-sm text-gray-500 mt-1">Kelola profil sekolah (SMP/SMA/SMK).</p>
        </div>
        <button 
          onClick={() => setEditing({ id: '', name: '', level: SchoolLevel.SMA, logoUrl: '', headmasterName: '', headmasterNIP: '', address: '' })}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah Sekolah
        </button>
      </div>

      {editing && (
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex justify-between items-start mb-6">
             <h3 className="font-bold text-blue-900 text-lg flex items-center gap-2"><Edit2 className="w-5 h-5" /> Form Data Sekolah</h3>
             <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-red-500"><XCircle className="w-6 h-6" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Nama Sekolah" icon={Building2} placeholder="Contoh: SMAN 1 Jakarta" value={editing.name} onChange={(e: any) => setEditing({...editing, name: e.target.value})} />
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Jenjang Sekolah</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <select
                    value={editing.level}
                    onChange={(e) => setEditing({...editing, level: e.target.value as SchoolLevel})}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm hover:border-gray-400 cursor-pointer"
                  >
                    <option value={SchoolLevel.SMP}>SMP (Sekolah Menengah Pertama)</option>
                    <option value={SchoolLevel.SMA}>SMA (Sekolah Menengah Atas)</option>
                    <option value={SchoolLevel.SMK}>SMK (Sekolah Menengah Kejuruan)</option>
                  </select>
                </div>
              </div>

              <InputGroup label="URL Logo Sekolah" icon={School} placeholder="https://..." value={editing.logoUrl} onChange={(e: any) => setEditing({...editing, logoUrl: e.target.value})} />
              <InputGroup label="Nama Kepala Sekolah" icon={UserCircle} placeholder="Nama & Gelar" value={editing.headmasterName} onChange={(e: any) => setEditing({...editing, headmasterName: e.target.value})} />
              <InputGroup label="NIP Kepala Sekolah" icon={Hash} placeholder="NIP" value={editing.headmasterNIP} onChange={(e: any) => setEditing({...editing, headmasterNIP: e.target.value})} />
              <div className="md:col-span-2">
                <InputGroup label="Alamat (Opsional)" icon={MapPin} placeholder="Alamat..." required={false} value={editing.address || ''} onChange={(e: any) => setEditing({...editing, address: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-blue-200/50">
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border hover:bg-gray-50">Batal</button>
              <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md"><Save className="w-4 h-4" /> Simpan Data</button>
            </div>
          </form>
        </div>
      )}

      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
          <tr><th className="px-6 py-4">Nama Sekolah</th><th className="px-6 py-4">Jenjang</th><th className="px-6 py-4">Kepala Sekolah</th><th className="px-6 py-4 text-right">Aksi</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {schools.map(s => (
            <tr key={s.id} className="hover:bg-blue-50/30">
              <td className="px-6 py-4 font-bold text-gray-900">{s.name}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-bold border ${
                  s.level === SchoolLevel.SMK ? 'bg-orange-100 text-orange-700 border-orange-200' :
                  s.level === SchoolLevel.SMP ? 'bg-green-100 text-green-700 border-green-200' :
                  'bg-blue-100 text-blue-700 border-blue-200'
                }`}>
                  {s.level}
                </span>
              </td>
              <td className="px-6 py-4">{s.headmasterName}<br/><span className="text-xs text-gray-500">{s.headmasterNIP}</span></td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button onClick={() => setEditing(s)} className="p-2 text-blue-600 hover:bg-blue-100 rounded"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4"/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- TEACHER MANAGER ---
const TeacherManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<{ username: string; name: string; password?: string; originalUsername?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setUsers(await storageService.getUsers());
    setLoading(false);
  };
  useEffect(() => { loadUsers(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setLoading(true);
      if (editing.originalUsername && editing.originalUsername !== editing.username) {
         await storageService.deleteUser(editing.originalUsername);
      }
      const payload: any = { username: editing.username, name: editing.name, role: 'user' };
      if (editing.password) payload.password = editing.password;
      else if (!editing.originalUsername) { alert("Password wajib diisi."); setLoading(false); return; }
      
      await storageService.saveUser(payload);
      setEditing(null);
      await loadUsers();
      setLoading(false);
    }
  };
  const handleDelete = async (u: string) => { if (confirm('Hapus guru?')) { await storageService.deleteUser(u); loadUsers(); }};

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
        <div><h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users className="text-green-600" /> Manajemen Guru</h2></div>
        <button onClick={() => setEditing({ username: '', name: '', password: '' })} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 shadow-md"><Plus className="w-4 h-4" /> Tambah Guru</button>
      </div>
      {editing && (
        <div className="p-6 bg-green-50 border-b border-green-100">
           <div className="flex justify-between items-start mb-6">
             <h3 className="font-bold text-green-900 text-lg flex items-center gap-2"><Edit2 className="w-5 h-5" /> {editing.originalUsername ? 'Edit Guru' : 'Tambah Guru'}</h3>
             <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-red-500"><XCircle className="w-6 h-6" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputGroup label="Username" icon={UserCircle} value={editing.username} onChange={(e: any) => setEditing({...editing, username: e.target.value})} />
              <InputGroup label="Nama Lengkap" icon={GraduationCap} value={editing.name} onChange={(e: any) => setEditing({...editing, name: e.target.value})} />
              <InputGroup label="Password" icon={Key} type="text" required={!editing.originalUsername} value={editing.password || ''} onChange={(e: any) => setEditing({...editing, password: e.target.value})} placeholder={editing.originalUsername ? "Opsional" : "Wajib"} />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-green-200/50">
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 rounded bg-white border">Batal</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded bg-green-600 text-white hover:bg-green-700">Simpan</button>
            </div>
          </form>
        </div>
      )}
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b"><tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Username</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {users.map(u => (
            <tr key={u.username} className="hover:bg-green-50/30">
              <td className="px-6 py-4 font-medium">{u.name}</td>
              <td className="px-6 py-4 font-mono text-xs text-gray-500 bg-gray-50 px-2 rounded w-fit">{u.username}</td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button onClick={() => setEditing({ username: u.username, name: u.name, password: '', originalUsername: u.username })} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(u.username)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- SUBJECT MANAGER ---
const SubjectManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSubjects = async () => {
    setLoading(true);
    setSubjects(await storageService.getSubjects());
    setLoading(false);
  };
  useEffect(() => { loadSubjects(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setLoading(true);
      await storageService.saveSubject(editing);
      setEditing(null);
      await loadSubjects();
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => { if (confirm('Hapus mapel?')) { await storageService.deleteSubject(id); loadSubjects(); }};

  const toggleLevel = (level: SchoolLevel) => {
    if (!editing) return;
    const levels = editing.levels || [];
    if (levels.includes(level)) {
      setEditing({...editing, levels: levels.filter(l => l !== level)});
    } else {
      setEditing({...editing, levels: [...levels, level]});
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
        <div><h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BookOpen className="text-purple-600" /> Mata Pelajaran</h2></div>
        <button onClick={() => setEditing({ id: '', name: '', levels: [SchoolLevel.SMA] })} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 shadow-md"><Plus className="w-4 h-4" /> Tambah Mapel</button>
      </div>
      {editing && (
        <div className="p-6 bg-purple-50 border-b border-purple-100">
           <div className="flex justify-between items-start mb-6">
             <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2"><Edit2 className="w-5 h-5" /> Form Mapel</h3>
             <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-red-500"><XCircle className="w-6 h-6" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <InputGroup label="Nama Mata Pelajaran" icon={BookOpen} value={editing.name} onChange={(e: any) => setEditing({...editing, name: e.target.value})} placeholder="Contoh: Ekonomi" />
            
            {/* Level Selection */}
            <div className="space-y-2">
               <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Tersedia untuk Jenjang:</label>
               <div className="flex gap-4">
                 {Object.values(SchoolLevel).map(level => (
                   <label key={level} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border border-purple-200 hover:border-purple-400 transition-colors">
                     <input 
                        type="checkbox" 
                        checked={editing.levels?.includes(level)} 
                        onChange={() => toggleLevel(level)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                     />
                     <span className="text-sm font-medium text-gray-700">{level}</span>
                   </label>
                 ))}
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-purple-200/50">
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 rounded bg-white border">Batal</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded bg-purple-600 text-white hover:bg-purple-700">Simpan</button>
            </div>
          </form>
        </div>
      )}
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b"><tr><th className="px-6 py-4">Nama Mata Pelajaran</th><th className="px-6 py-4">Jenjang</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {subjects.map(s => (
            <tr key={s.id} className="hover:bg-purple-50/30">
              <td className="px-6 py-4 font-medium">{s.name}</td>
              <td className="px-6 py-4 flex gap-1">
                 {s.levels && s.levels.map(l => (
                    <span key={l} className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-gray-200 rounded text-gray-600">{l}</span>
                 ))}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditing(s)} className="p-2 text-blue-600 hover:bg-blue-100 rounded"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const WebsiteSettings: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-100"><Settings className="w-10 h-10 text-gray-400" /></div>
    <h2 className="text-2xl font-bold text-gray-900 mb-3">Pengaturan Global</h2>
    <p className="text-gray-500 max-w-md mx-auto mb-8">Administrator dapat mengubah Judul Aplikasi dan Logo.</p>
  </div>
);
