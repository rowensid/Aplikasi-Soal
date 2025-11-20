import React, { useState, useEffect } from 'react';
import { Globe2, LogOut, LayoutDashboard, FileText, Code2 } from 'lucide-react';
import { GradeLevel, Semester, ExamData, GeneratorConfig, User, SchoolLevel } from './types';
import { generateExam } from './services/geminiService';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { ExamPaper } from './components/ExamPaper';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { storageService } from './services/storage';

function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // App State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examData, setExamData] = useState<ExamData | null>(null);
  
  const [config, setConfig] = useState<GeneratorConfig>({
    subject: '',
    grade: GradeLevel.X,
    semester: Semester.GANJIL,
    schoolName: '', // Will be filled by Dropdown
    schoolLevel: SchoolLevel.SMA,
    logoUrl: '', 
    headmasterName: '',
    headmasterNIP: '',
    teacherName: '',
    teacherNIP: '',
    mcqCount: 25, // Default Value
    essayCount: 5 // Default Value
  });

  // Check for existing session on mount
  useEffect(() => {
    const session = storageService.getUserSession();
    if (session) {
      setUser(session);
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    storageService.setUserSession(loggedInUser);
    setUser(loggedInUser);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateExam(config);
      setExamData(data);
    } catch (err) {
      setError('Gagal menyusun dokumen. Silahkan coba lagi beberapa saat lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storageService.clearUserSession();
    setUser(null);
    setExamData(null);
    setConfig(prev => ({...prev, schoolName: ''}));
  };

  // 1. Not Logged In -> Show Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col print:bg-white">
      {/* Navigation / Header - Hidden on Print */}
      <nav className="bg-slate-900 border-b border-slate-800 no-print print:hidden text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-blue-900/50 shadow-lg">
                <Globe2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Aplikasi Soal <span className="text-blue-400">Pro</span></h1>
                <p className="text-xs text-slate-400 font-medium">Platform Digitalisasi Ujian Sekolah</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden md:flex flex-col text-right mr-2">
                 <span className="text-sm font-bold text-white">{user.name}</span>
                 <span className="text-xs text-slate-400 uppercase tracking-wider">{user.role === 'admin' ? 'Administrator' : 'Guru Mapel'}</span>
               </div>
               <button 
                onClick={handleLogout}
                className="p-2 bg-slate-800 hover:bg-red-600 rounded-full transition-colors text-slate-300 hover:text-white"
                title="Keluar"
               >
                 <LogOut className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full print:p-0 print:m-0 print:max-w-none print:w-full">
        
        {/* ADMIN VIEW */}
        {user.role === 'admin' && (
          <div className="space-y-6 print:hidden">
            <div className="flex items-center gap-2 mb-4">
               <LayoutDashboard className="text-blue-600" />
               <h2 className="text-2xl font-bold text-gray-800">Dashboard Admin</h2>
            </div>
            <AdminDashboard />
          </div>
        )}

        {/* USER VIEW (TEACHER) */}
        {user.role === 'user' && (
          <div className="flex flex-col lg:flex-row gap-8 print:block">
            
            {/* Left Sidebar: Controls - Hidden on Print */}
            <div className="w-full lg:w-1/4 flex-shrink-0 no-print print:hidden">
              <ConfigurationPanel 
                config={config}
                setConfig={setConfig}
                onGenerate={handleGenerate}
                loading={loading}
              />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
                  <p className="font-bold text-sm">System Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Right Content: Exam Preview - Full Width on Print */}
            <div className="w-full lg:w-3/4 print:w-full print:max-w-none">
              {!examData && !loading && (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500 h-[600px] flex flex-col justify-center items-center no-print">
                  <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <FileText className="w-16 h-16 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Area Kerja Dokumen</h3>
                  <p className="max-w-md mx-auto">
                    Silahkan pilih profil sekolah pada panel di sebelah kiri, lalu klik tombol <span className="font-bold text-blue-600">Generate Dokumen Soal</span> untuk memulai proses penyusunan.
                  </p>
                </div>
              )}

              {loading && (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200 h-[600px] flex flex-col justify-center items-center no-print">
                  <div className="animate-pulse flex flex-col items-center w-full max-w-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                    <div className="space-y-3 w-full">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <p className="mt-8 text-gray-600 font-medium animate-pulse">Sedang menyusun format dokumen & kunci jawaban...</p>
                </div>
              )}

              {examData && !loading && (
                <ExamPaper data={examData} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="no-print print:hidden py-6 text-center border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Code2 className="w-4 h-4" />
          <span>Developed by <span className="font-bold text-blue-700">VRS Space</span></span>
          <span>•</span>
          <span>© {new Date().getFullYear()} All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;