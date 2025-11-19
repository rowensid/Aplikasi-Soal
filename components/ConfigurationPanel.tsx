
import React, { useEffect, useState } from 'react';
import { GradeLevel, Semester, GeneratorConfig, SchoolProfile, Subject, SchoolLevel } from '../types';
import { Loader2, School, RefreshCw, User, Hash, BookOpen, Calendar, GraduationCap, ChevronDown, FileCheck, FileText, Settings2 } from 'lucide-react';
import { storageService } from '../services/storage';

interface Props {
  config: GeneratorConfig;
  setConfig: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
  onGenerate: () => void;
  loading: boolean;
}

export const ConfigurationPanel: React.FC<Props> = ({ config, setConfig, onGenerate, loading }) => {
  const [schools, setSchools] = useState<SchoolProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Helper state to filter options
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [availableGrades, setAvailableGrades] = useState<GradeLevel[]>([]);

  const loadData = async () => {
    setRefreshing(true);
    setSchools(await storageService.getSchools());
    setSubjects(await storageService.getSubjects());
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  // Filter logic when School or Subjects change
  useEffect(() => {
    if (config.schoolName) {
      const selectedSchool = schools.find(s => s.name === config.schoolName);
      if (selectedSchool) {
        const level = selectedSchool.level || SchoolLevel.SMA;
        
        // 1. Filter Subjects based on Level
        const fs = subjects.filter(s => s.levels && s.levels.includes(level));
        setFilteredSubjects(fs);

        // 2. Filter Grades based on Level
        if (level === SchoolLevel.SMP) {
          setAvailableGrades([GradeLevel.VII, GradeLevel.VIII, GradeLevel.IX]);
          // Auto-correct if current selection is invalid for SMP
          if (config.grade === GradeLevel.X || config.grade === GradeLevel.XI || config.grade === GradeLevel.XII) {
             setConfig(prev => ({...prev, grade: GradeLevel.VII}));
          }
        } else {
          setAvailableGrades([GradeLevel.X, GradeLevel.XI, GradeLevel.XII]);
          // Auto-correct if current selection is invalid for SMA/SMK
           if (config.grade === GradeLevel.VII || config.grade === GradeLevel.VIII || config.grade === GradeLevel.IX) {
             setConfig(prev => ({...prev, grade: GradeLevel.X}));
          }
        }
      }
    } else {
       setFilteredSubjects(subjects);
       setAvailableGrades(Object.values(GradeLevel));
    }
  }, [config.schoolName, schools, subjects]);

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSchool = schools.find(s => s.name === e.target.value);
    if (selectedSchool) {
      setConfig({
        ...config,
        schoolName: selectedSchool.name,
        schoolLevel: selectedSchool.level,
        logoUrl: selectedSchool.logoUrl,
        headmasterName: selectedSchool.headmasterName,
        headmasterNIP: selectedSchool.headmasterNIP
      });
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-800 h-fit sticky top-24 text-white">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          Setup Dokumen
        </h2>
        <p className="text-xs text-slate-400 mt-1 ml-4">Konfigurasi identitas sekolah & soal.</p>
      </div>
      
      <div className="space-y-6">
        {/* School Selection */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide ml-1">Pilih Sekolah</label>
            <button onClick={loadData} className="text-blue-400 hover:text-blue-300 transition-transform hover:rotate-180" title="Sync Database">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
              <School className="h-5 w-5" />
            </div>
            <select
              value={schools.find(s => s.name === config.schoolName)?.name || ''}
              onChange={handleSchoolChange}
              className="block w-full pl-10 pr-10 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950 text-white text-sm appearance-none shadow-sm transition-all cursor-pointer hover:border-slate-600"
            >
              <option value="" disabled>-- Pilih Sekolah --</option>
              {schools.map(s => (<option key={s.id} value={s.name}>{s.name} ({s.level || 'SMA'})</option>))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500"><ChevronDown className="h-4 w-4" /></div>
          </div>
          {!config.schoolName && schools.length === 0 && <p className="text-[10px] text-red-400 ml-1 mt-1">*Data sekolah kosong. Hubungi Admin.</p>}
        </div>

        {/* SUBJECT SELECTION - DYNAMIC FILTERED */}
        <div className="space-y-1.5">
           <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide ml-1">Mata Pelajaran</label>
           <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
               <BookOpen className="h-5 w-5" />
             </div>
             <select
               value={config.subject || ''}
               onChange={(e) => setConfig({...config, subject: e.target.value})}
               disabled={!config.schoolName}
               className="block w-full pl-10 pr-10 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950 text-white text-sm appearance-none shadow-sm transition-all cursor-pointer hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <option value="" disabled>-- Pilih Mapel {config.schoolLevel ? `(${config.schoolLevel})` : ''} --</option>
               {filteredSubjects.map(s => (<option key={s.id} value={s.name}>{s.name}</option>))}
             </select>
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500"><ChevronDown className="h-4 w-4" /></div>
           </div>
        </div>

        {/* SPECIFIC TOPIC INPUT */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide ml-1">Topik / Materi Khusus</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={config.topic || ''}
              onChange={(e) => setConfig({...config, topic: e.target.value})}
              placeholder="Contoh: Trigonometri / Perang Dunia II"
              className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950 text-white text-sm placeholder-slate-600 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Grade & Semester Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide ml-1">Kelas</label>
            <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <GraduationCap className="h-5 w-5" />
               </div>
               <select
                  value={config.grade}
                  onChange={(e) => setConfig({...config, grade: e.target.value as GradeLevel})}
                  disabled={!config.schoolName}
                  className="block w-full pl-10 pr-8 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950 text-white text-sm appearance-none shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {availableGrades.map((g) => (<option key={g} value={g}>{g}</option>))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-500"><ChevronDown className="h-4 w-4" /></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide ml-1">Semester</label>
            <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Calendar className="h-5 w-5" />
               </div>
               <select
                  value={config.semester}
                  onChange={(e) => setConfig({...config, semester: e.target.value as Semester})}
                  className="block w-full pl-10 pr-8 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950 text-white text-sm appearance-none shadow-sm transition-all cursor-pointer"
                >
                  {Object.values(Semester).map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-500"><ChevronDown className="h-4 w-4" /></div>
            </div>
          </div>
        </div>

        {/* NEW: QUESTION COUNT SETTINGS */}
        <div className="space-y-2 pt-2 border-t border-slate-800/50">
           <div className="flex items-center gap-2 mb-1">
              <Settings2 className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Konfigurasi Soal</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[10px] text-slate-400">Pilihan Ganda</label>
               <input 
                 type="number" 
                 min={5} 
                 max={50}
                 value={config.mcqCount}
                 onChange={(e) => setConfig({...config, mcqCount: parseInt(e.target.value) || 20})}
                 className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white text-center focus:ring-1 focus:ring-blue-500"
               />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] text-slate-400">Essay / Uraian</label>
               <input 
                 type="number" 
                 min={0} 
                 max={10}
                 value={config.essayCount}
                 onChange={(e) => setConfig({...config, essayCount: parseInt(e.target.value) || 5})}
                 className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white text-center focus:ring-1 focus:ring-blue-500"
               />
             </div>
           </div>
        </div>

        {/* Manual Input Details */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
           <div className="space-y-1.5">
             <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide ml-1">Nama Guru</label>
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                 <User className="h-5 w-5" />
               </div>
               <input
                 type="text"
                 value={config.teacherName}
                 onChange={(e) => setConfig({...config, teacherName: e.target.value})}
                 className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950 text-white text-sm placeholder-slate-600 shadow-sm transition-all"
                 placeholder="Nama & Gelar"
               />
             </div>
           </div>

           <div className="space-y-1.5">
             <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide ml-1">NIP Guru</label>
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                 <Hash className="h-5 w-5" />
               </div>
               <input
                 type="text"
                 value={config.teacherNIP}
                 onChange={(e) => setConfig({...config, teacherNIP: e.target.value})}
                 className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950 text-white text-sm placeholder-slate-600 shadow-sm transition-all"
                 placeholder="NIP"
               />
             </div>
           </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading || !config.schoolName || !config.subject}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-500 transition-all duration-200 font-bold shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Sedang Menyusun Dokumen...</span>
            </>
          ) : (
            <>
              <FileCheck className="h-5 w-5" />
              <span>Generate Dokumen Soal</span>
            </>
          )}
        </button>
        
        {(!config.schoolName || !config.subject) && (
           <p className="text-[10px] text-center text-slate-500">
             *Pilih Sekolah dan Mata Pelajaran untuk melanjutkan.
           </p>
        )}
      </div>
    </div>
  );
};
