
import React, { useState, useEffect, useRef } from 'react';
import { ExamData, QuestionMCQ, QuestionEssay } from '../types';
import { Printer, FileDown, Eye, EyeOff, Edit3, Save, FileType } from 'lucide-react';

interface Props {
  data: ExamData;
}

export const ExamPaper: React.FC<Props> = ({ data }) => {
  const [editableData, setEditableData] = useState<ExamData>(data);
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditableData(data);
  }, [data]);

  // Robust Print Handler
  const handlePrint = () => {
    // 1. Turn off editing mode to remove textareas
    setIsEditing(false);
    
    // 2. Use setTimeout to allow React State to flush/render the "read-only" view
    // before the browser opens the print dialog.
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Handle Word Export
  const handleExportWord = () => {
    setIsEditing(false);
    
    const data = editableData;
    const logoHtml = data.logoUrl 
      ? `<img src="${data.logoUrl}" width="80" height="80" style="object-fit:contain;" />` 
      : '';

    // Helper to generate the header table (Word loves tables)
    const generateHeader = () => `
      <table style="width: 100%; border-bottom: 3px double black; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
        <tr>
          <td style="width: 15%; vertical-align: middle; text-align: center;">${logoHtml}</td>
          <td style="width: 85%; text-align: center; vertical-align: middle;">
            <p style="margin:0; font-size: 14pt; font-weight: bold;">PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA</p>
            <p style="margin:0; font-size: 16pt; font-weight: bold;">${data.schoolName?.toUpperCase()}</p>
            <p style="margin:0; font-size: 10pt;">Jl. Pendidikan No. 1, Kota Pelajar, Indonesia</p>
          </td>
        </tr>
      </table>
      <div style="text-align: center; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
        <p style="margin:0; font-size: 12pt; font-weight: bold; text-decoration: underline;">${data.title?.toUpperCase()}</p>
        <p style="margin:0; font-size: 10pt;">Tahun Pelajaran ${new Date().getFullYear()}/${new Date().getFullYear()+1}</p>
      </div>
    `;

    // Helper for Identity Table
    const generateIdentity = () => `
      <table style="width: 100%; font-family: 'Times New Roman', serif; font-size: 11pt; margin-bottom: 15px;">
        <tr>
          <td style="width: 15%">Mata Pelajaran</td><td style="width: 2%">:</td><td style="width: 40%"><b>${data.subject}</b></td>
          <td style="width: 15%">Hari/Tanggal</td><td style="width: 2%">:</td><td style="width: 26%">....................</td>
        </tr>
        <tr>
          <td>Kelas/Semester</td><td>:</td><td>${data.grade} / ${data.semester}</td>
          <td>Waktu</td><td>:</td><td>90 Menit</td>
        </tr>
      </table>
    `;

    // Content Construction
    const mcqContent = data.multipleChoice.map((q, i) => `
      <div style="margin-bottom: 10px; page-break-inside: avoid;">
        <table style="width: 100%; vertical-align: top;">
          <tr>
            <td style="width: 30px; vertical-align: top;">${i+1}.</td>
            <td>${q.question}</td>
          </tr>
        </table>
        <div style="margin-left: 30px;">
          ${q.options.map((opt, idx) => `
            <p style="margin: 2px 0;">${String.fromCharCode(65+idx)}. ${opt}</p>
          `).join('')}
        </div>
      </div>
    `).join('');

    const essayContent = data.essay.map((q, i) => `
      <div style="margin-bottom: 15px; page-break-inside: avoid;">
        <table style="width: 100%; vertical-align: top;">
          <tr>
            <td style="width: 30px; vertical-align: top;">${i+1}.</td>
            <td>${q.question}</td>
          </tr>
        </table>
      </div>
    `).join('');

    const signatureContent = `
      <table style="width: 100%; margin-top: 50px; page-break-inside: avoid; text-align: center;">
        <tr>
          <td style="width: 40%">
            Mengetahui,<br/>Kepala Sekolah<br/><br/><br/><br/>
            <b><u>${data.headmasterName}</u></b><br/>
            NIP. ${data.headmasterNIP}
          </td>
          <td style="width: 20%"></td>
          <td style="width: 40%">
            Jakarta, ${data.date}<br/>Guru Mata Pelajaran<br/><br/><br/><br/>
            <b><u>${data.teacherName}</u></b><br/>
            NIP. ${data.teacherNIP}
          </td>
        </tr>
      </table>
    `;

    const keyContent = `
      <br clear="all" style="page-break-before:always" />
      <h2 style="text-align:center;">KUNCI JAWABAN</h2>
      <h3>A. PILIHAN GANDA</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: center;">
        ${Array.from({ length: Math.ceil(data.multipleChoice.length / 5) }).map((_, rowIdx) => `
          <tr>
            ${data.multipleChoice.slice(rowIdx * 5, (rowIdx + 1) * 5).map((q, colIdx) => `
              <td style="border: 1px solid black; padding: 5px;">
                <b>${(rowIdx * 5) + colIdx + 1}. ${q.correctAnswer}</b>
              </td>
            `).join('')}
          </tr>
        `).join('')}
      </table>
      
      <h3>B. URAIAN</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
        <tr style="background-color: #eee;">
          <th style="border: 1px solid black; padding: 5px; width: 50px;">No</th>
          <th style="border: 1px solid black; padding: 5px;">Jawaban & Pedoman</th>
        </tr>
        ${data.essay.map((q, i) => `
          <tr>
            <td style="border: 1px solid black; padding: 5px; text-align: center; vertical-align: top;">${i+1}</td>
            <td style="border: 1px solid black; padding: 5px; white-space: pre-wrap;">${q.answerKey}</td>
          </tr>
        `).join('')}
      </table>
    `;

    const gridContent = `
      <br clear="all" style="page-break-before:always" />
      <h2 style="text-align:center;">KISI-KISI PENULISAN SOAL</h2>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 10pt;">
        <tr style="background-color: #eee; text-align: center;">
          <th style="border: 1px solid black; padding: 5px;">No</th>
          <th style="border: 1px solid black; padding: 5px;">CP</th>
          <th style="border: 1px solid black; padding: 5px;">Materi</th>
          <th style="border: 1px solid black; padding: 5px;">Indikator Soal</th>
          <th style="border: 1px solid black; padding: 5px;">Bentuk</th>
          <th style="border: 1px solid black; padding: 5px;">No. Soal</th>
        </tr>
        ${[...data.multipleChoice.map(q => ({...q, type: 'PG'})), ...data.essay.map(q => ({...q, type: 'Uraian'}))].map((row, i) => `
          <tr>
            <td style="border: 1px solid black; padding: 3px; text-align: center;">${i+1}</td>
            <td style="border: 1px solid black; padding: 3px;">${row.cp || '-'}</td>
            <td style="border: 1px solid black; padding: 3px;">${row.material || '-'}</td>
            <td style="border: 1px solid black; padding: 3px;">${row.indicator || '-'}</td>
            <td style="border: 1px solid black; padding: 3px; text-align: center;">${row.type}</td>
            <td style="border: 1px solid black; padding: 3px; text-align: center;">${i+1}</td>
          </tr>
        `).join('')}
      </table>
    `;

    // Combine all
    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${data.title}</title>
      <style>body { font-family: 'Times New Roman', serif; font-size: 12pt; }</style>
      </head><body>
      ${generateHeader()}
      ${generateIdentity()}
      <div style="margin-bottom: 10px; border: 1px solid black; padding: 5px; font-size: 10pt;">
        <b>Petunjuk Umum:</b><br/>1. Berdoa sebelum mengerjakan.<br/>2. Periksa kelengkapan soal.
      </div>
      <h3>A. PILIHAN GANDA</h3>
      ${mcqContent}
      <h3>B. URAIAN</h3>
      ${essayContent}
      ${signatureContent}
      ${showKey ? keyContent : ''}
      ${showKey ? gridContent : ''}
      </body></html>
    `;

    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(fullHtml);
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    
    // @ts-ignore
    if (navigator.msSaveOrOpenBlob) {
        // @ts-ignore
        navigator.msSaveOrOpenBlob(blob, `soal_${data.subject}.doc`);
    } else {
        downloadLink.href = url;
        downloadLink.download = `soal_${data.subject}.doc`;
        downloadLink.click();
    }
    document.body.removeChild(downloadLink);
  };

  // --- UPDATE HANDLERS ---
  const updateMCQ = (id: number, field: keyof QuestionMCQ, value: any) => {
    setEditableData(prev => ({
      ...prev,
      multipleChoice: prev.multipleChoice.map(q => q.id === id ? { ...q, [field]: value } : q)
    }));
  };

  const updateMCQOption = (qId: number, optIndex: number, value: string) => {
    setEditableData(prev => ({
      ...prev,
      multipleChoice: prev.multipleChoice.map(q => {
        if (q.id !== qId) return q;
        const newOpts = [...q.options];
        newOpts[optIndex] = value;
        return { ...q, options: newOpts };
      })
    }));
  };

  const updateEssay = (id: number, field: keyof QuestionEssay, value: string) => {
    setEditableData(prev => ({
      ...prev,
      essay: prev.essay.map(q => q.id === id ? { ...q, [field]: value } : q)
    }));
  };

  // Paper Sheet Classes
  const paperSheetClass = "paper-sheet w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[2cm] text-black font-serif text-[11pt] leading-relaxed relative mb-8";

  return (
    <div className="w-full flex flex-col items-center pb-12 bg-gray-100 print:bg-white print:pb-0 print:block">
      {/* PRINT STYLES: VISIBILITY TRICK */}
      {/* This technique hides ALL body content, then specifically shows only the exam paper.
          It positions the exam paper at 0,0 absolute to ensure it takes up the full print page,
          ignoring the sidebar or navbar layout. */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          
          body {
            background-color: white;
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }

          /* HIDE EVERYTHING */
          body * {
            visibility: hidden;
          }

          /* SHOW ONLY THE PRINT CONTAINER */
          .print-container, .print-container * {
            visibility: visible;
          }

          /* POSITION IT OVER EVERYTHING */
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          
          /* RESET SHEET STYLING FOR PRINT */
          .paper-sheet {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 2cm !important;
            page-break-after: always;
          }
          
          .paper-sheet:last-child {
             page-break-after: auto;
          }
          
          /* HIDE UI ELEMENTS EXPLICITLY */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* TOOLBAR */}
      <div className="w-full max-w-[210mm] bg-slate-800 text-white p-4 rounded-t-xl flex flex-col sm:flex-row justify-between items-center no-print sticky top-16 z-30 shadow-lg gap-4 mb-8">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span className="text-sm font-bold">{isEditing ? 'Selesai Edit' : 'Edit Soal'}</span>
          </button>
          
          <button 
            onClick={() => setShowKey(!showKey)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm font-medium">{showKey ? 'Sembunyikan Kunci' : 'Tampilkan Kunci'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
           <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors text-sm" title="Membuka dialog print browser, lalu pilih 'Save as PDF'">
             <FileType className="w-4 h-4" /> Download PDF
           </button>
           <button onClick={handleExportWord} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors text-sm">
             <FileDown className="w-4 h-4" /> Word
           </button>
           <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-white text-slate-900 hover:bg-gray-100 rounded-lg font-bold transition-colors text-sm">
             <Printer className="w-4 h-4" /> Print
           </button>
        </div>
      </div>

      {/* PRINT CONTAINER WRAPPER - Ref captured here */}
      <div ref={printRef} className="print-container w-full flex flex-col items-center">
        
        {/* --- SHEET 1: MAIN EXAM PAPER --- */}
        <div className={paperSheetClass}>
          {/* 1. KOP SURAT */}
          <div className="header-section flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6 text-black">
             <div className="w-24 h-24 flex items-center justify-center mr-4">
               {editableData.logoUrl ? (
                 <img 
                   src={editableData.logoUrl} 
                   alt="Logo" 
                   className="w-full h-full object-contain" 
                   crossOrigin="anonymous"
                   onError={(e) => {
                     (e.target as HTMLImageElement).style.display = 'none';
                   }}
                 />
               ) : (
                 <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center text-xs text-gray-400">No Logo</div>
               )}
             </div>
             <div className="flex-1 text-center uppercase text-black">
                <h3 className="text-lg font-bold m-0 text-black">PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA</h3>
                <h2 className="text-xl font-bold m-0 text-black">{editableData.schoolName}</h2>
                <p className="text-sm font-normal m-0 capitalize text-black">Jl. Pendidikan No. 1, Kota Pelajar, Indonesia 10110</p>
                <p className="text-sm font-normal m-0 italic text-black">Website: www.sekolahhebat.sch.id | Email: admin@sekolah.sch.id</p>
             </div>
             <div className="w-24"></div> {/* Spacer for balance */}
          </div>

          {/* 2. JUDUL UJIAN */}
          <div className="text-center mb-6 text-black">
             <h1 className="text-lg font-bold uppercase underline decoration-1 underline-offset-4 mb-1 text-black">{editableData.title}</h1>
             <p className="text-sm text-black">Tahun Pelajaran {new Date().getFullYear()}/{new Date().getFullYear()+1}</p>
          </div>

          {/* 3. IDENTITAS */}
          <table className="w-full mb-6 text-sm no-border text-black">
             <tbody>
               <tr>
                 <td className="w-[15%] py-1 text-black">Mata Pelajaran</td>
                 <td className="w-[1%] py-1 text-black">:</td>
                 <td className="w-[44%] py-1 font-bold text-black">{editableData.subject}</td>
                 <td className="w-[15%] py-1 text-black">Hari / Tanggal</td>
                 <td className="w-[1%] py-1 text-black">:</td>
                 <td className="w-[24%] py-1 text-black">....................</td>
               </tr>
               <tr>
                 <td className="py-1 text-black">Kelas / Semester</td>
                 <td className="py-1 text-black">:</td>
                 <td className="py-1 text-black">{editableData.grade} / {editableData.semester}</td>
                 <td className="py-1 text-black">Waktu</td>
                 <td className="py-1 text-black">:</td>
                 <td className="py-1 text-black">90 Menit</td>
               </tr>
             </tbody>
          </table>

          {/* 4. PETUNJUK */}
          <div className="mb-6 border border-black p-3 text-xs bg-gray-50 print:bg-transparent text-black">
             <p className="font-bold mb-1 text-black">Petunjuk Umum:</p>
             <ol className="list-decimal ml-4 space-y-0.5 text-black">
               <li>Periksa dan bacalah soal-soal sebelum Anda menjawabnya.</li>
               <li>Laporkan kepada pengawas ujian apabila terdapat lembar soal yang kurang jelas, rusak, atau tidak lengkap.</li>
               <li>Tidak diizinkan menggunakan kalkulator, HP, tabel matematika atau alat bantu hitung lainnya.</li>
             </ol>
          </div>

          {/* 5. SOAL PILIHAN GANDA */}
          <div className="mb-8 text-black">
             <h3 className="font-bold mb-4 text-black">A. PILIHAN GANDA</h3>
             <div className="space-y-4 text-black">
               {editableData.multipleChoice.map((q, i) => (
                 <div key={q.id} className="question-block avoid-break mb-4 text-black">
                   <div className="flex gap-1">
                      <span className="font-bold min-w-[24px] text-black">{i + 1}.</span>
                      <div className="w-full text-black">
                        {isEditing ? (
                          <textarea 
                            value={q.question}
                            onChange={(e) => updateMCQ(q.id, 'question', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm font-sans mb-2 bg-white text-black"
                            rows={2}
                          />
                        ) : (
                          <p className="mb-2 text-justify whitespace-pre-wrap text-black">{q.question}</p>
                        )}
                        
                        {/* Options */}
                        <div className="pl-2 space-y-1 text-black">
                           {q.options.map((opt, idx) => {
                             const label = String.fromCharCode(65 + idx); // A, B, C...
                             return (
                               <div key={idx} className="flex gap-2 text-black">
                                 <span className="font-medium min-w-[20px] text-black">{label}.</span>
                                 {isEditing ? (
                                    <input 
                                      type="text"
                                      value={opt}
                                      onChange={(e) => updateMCQOption(q.id, idx, e.target.value)}
                                      className="w-full p-1 border border-gray-300 rounded text-sm font-sans bg-white text-black"
                                    />
                                 ) : (
                                    <span className="text-justify text-black">{opt}</span>
                                 )}
                               </div>
                             );
                           })}
                        </div>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* 6. SOAL ESSAY */}
          <div className="mb-8 text-black">
             <h3 className="font-bold mb-4 text-black">B. URAIAN</h3>
             <div className="space-y-6 text-black">
               {editableData.essay.map((q, i) => (
                 <div key={q.id} className="question-block avoid-break mb-4 text-black">
                   <div className="flex gap-1 text-black">
                      <span className="font-bold min-w-[24px] text-black">{i + 1}.</span>
                      <div className="w-full text-black">
                         {isEditing ? (
                          <textarea 
                            value={q.question}
                            onChange={(e) => updateEssay(q.id, 'question', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm font-sans mb-2 bg-white text-black"
                            rows={3}
                          />
                        ) : (
                          <p className="mb-4 text-justify whitespace-pre-wrap text-black">{q.question}</p>
                        )}
                      </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* 7. TANDA TANGAN */}
          <div className="flex justify-between mt-12 avoid-break text-black">
             <div className="text-center text-black">
                <p className="text-black">Mengetahui,</p>
                <p className="text-black">Kepala Sekolah</p>
                <br /><br /><br />
                <p className="font-bold underline text-black">{editableData.headmasterName}</p>
                <p className="text-black">NIP. {editableData.headmasterNIP}</p>
             </div>
             <div className="text-center text-black">
                <p className="text-black">{editableData.schoolName?.includes('Jakarta') ? 'Jakarta' : '..................'}, {editableData.date}</p>
                <p className="text-black">Guru Mata Pelajaran</p>
                <br /><br /><br />
                <p className="font-bold underline text-black">{editableData.teacherName}</p>
                <p className="text-black">NIP. {editableData.teacherNIP}</p>
             </div>
          </div>
        </div>

        {/* --- SHEET 2: KUNCI JAWABAN --- */}
        {showKey && (
          <div className={`${paperSheetClass} break-before-page`}>
            <h1 className="text-center font-bold text-lg mb-6 text-black border-b-2 border-black pb-2">KUNCI JAWABAN & PEDOMAN PENSKORAN</h1>
            
            <div className="mb-6 text-black">
              <h3 className="font-bold border-b border-black mb-2 text-black bg-gray-100 p-1">A. KUNCI JAWABAN PILIHAN GANDA</h3>
              <div className="grid grid-cols-5 gap-2 text-sm text-black mt-4">
                {editableData.multipleChoice.map((q, i) => (
                  <div key={q.id} className="p-1 border border-gray-200 text-center text-black avoid-break">
                    <span className="font-bold text-black">{i + 1}. {q.correctAnswer}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-black">
               <h3 className="font-bold border-b border-black mb-4 text-black bg-gray-100 p-1">B. KUNCI JAWABAN URAIAN</h3>
               <table className="w-full text-sm text-black mt-4 border-collapse">
                 <thead>
                   <tr className="bg-gray-100 text-black">
                     <th className="w-10 text-center border border-black text-black p-2">No</th>
                     <th className="border border-black text-black p-2">Jawaban & Pedoman Penskoran</th>
                   </tr>
                 </thead>
                 <tbody>
                   {editableData.essay.map((q, i) => (
                     <tr key={q.id} className="text-black avoid-break">
                       <td className="text-center font-bold border border-black text-black p-2 align-top">{i + 1}</td>
                       <td className="whitespace-pre-wrap border border-black p-2 text-black">
                         {isEditing ? (
                            <textarea 
                              value={q.answerKey}
                              onChange={(e) => updateEssay(q.id, 'answerKey', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded text-sm font-sans bg-white text-black"
                              rows={4}
                            />
                         ) : (
                            q.answerKey
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {/* --- SHEET 3: KISI-KISI --- */}
        {showKey && (
          <div className={`${paperSheetClass} break-before-page`}>
             <h1 className="text-center font-bold text-lg mb-6 text-black border-b-2 border-black pb-2">KISI-KISI PENULISAN SOAL</h1>
             
             <div className="mb-4 text-sm text-black">
               <p className="text-black"><strong>Satuan Pendidikan:</strong> {editableData.schoolName}</p>
               <p className="text-black"><strong>Mata Pelajaran:</strong> {editableData.subject}</p>
               <p className="text-black"><strong>Kelas / Semester:</strong> {editableData.grade} / {editableData.semester}</p>
             </div>

             <table className="w-full text-xs text-black border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-black">
                    <th className="w-8 border border-black p-2 text-black">No</th>
                    <th className="border border-black p-2 text-black">Capaian Pembelajaran (CP)</th>
                    <th className="border border-black p-2 text-black">Materi</th>
                    <th className="border border-black p-2 text-black">Indikator Soal</th>
                    <th className="w-12 border border-black p-2 text-black">Bentuk</th>
                    <th className="w-8 border border-black p-2 text-black">No. Soal</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Combine MCQ and Essay for Grid */}
                  {[...editableData.multipleChoice.map(q => ({...q, type: 'PG'})), ...editableData.essay.map(q => ({...q, type: 'Uraian'}))].map((row, i) => (
                    <tr key={i} className="text-black avoid-break">
                      <td className="text-center border border-black p-1 text-black align-top">{i+1}</td>
                      <td className="border border-black p-1 text-black align-top">{row.cp || '-'}</td>
                      <td className="border border-black p-1 text-black align-top">{row.material || '-'}</td>
                      <td className="border border-black p-1 text-black align-top">{row.indicator || '-'}</td>
                      <td className="text-center border border-black p-1 text-black align-top">{row.type}</td>
                      <td className="text-center border border-black p-1 text-black align-top">{i+1}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

      </div>
    </div>
  );
};
