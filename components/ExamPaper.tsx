import React, { useState, useEffect } from 'react';
import { ExamData, QuestionMCQ, QuestionEssay } from '../types';
import { Printer, FileDown, Eye, EyeOff, Edit3, Save, FileType, Grid, RefreshCw } from 'lucide-react';

interface Props {
  data: ExamData;
}

export const ExamPaper: React.FC<Props> = ({ data }) => {
  const [editableData, setEditableData] = useState<ExamData>(data);
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    setEditableData(data);
  }, [data]);

  // --- 1. DIRECT PDF DOWNLOAD (html2pdf) ---
  // Solusi untuk user yang tidak bisa menggunakan window.print() atau ingin file instan.
  const handleDownloadPDF = () => {
    if (isEditing) setIsEditing(false);
    setIsGeneratingPdf(true);

    setTimeout(() => {
      const element = document.getElementById('exam-print-area');
      const filename = `${(editableData.title || 'Ujian').replace(/\s+/g, '_')}.pdf`;

      const opt = {
        margin:       [10, 10, 10, 10], // Margin mm
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 }, // High quality image
        html2canvas:  { scale: 2, useCORS: true, logging: false }, // Scale 2x for sharper text
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } // Avoid cutting text
      };

      // Access html2pdf from window (injected in index.html)
      // @ts-ignore
      if (window.html2pdf) {
          // @ts-ignore
          window.html2pdf().set(opt).from(element).save().then(() => {
            setIsGeneratingPdf(false);
          }).catch((err: any) => {
            console.error(err);
            setIsGeneratingPdf(false);
            alert('Gagal download PDF. Coba gunakan tombol Cetak Browser.');
          });
      } else {
          alert('Library PDF sedang dimuat atau diblokir. Silahkan refresh halaman.');
          setIsGeneratingPdf(false);
      }
    }, 500);
  };

  // --- 2. NATIVE BROWSER PRINT (Vector Quality) ---
  // Cadangan untuk hasil teks super tajam
  const handleNativePrint = () => {
    if (isEditing) setIsEditing(false);
    setTimeout(() => {
      window.print();
    }, 500); 
  };

  // --- 3. WORD EXPORT ---
  const handleExportWord = () => {
    setIsEditing(false);
    
    const data = editableData;
    const safeSubject = (data.subject || 'Ujian').toString();

    const logoHtml = data.logoUrl 
      ? `<img src="${data.logoUrl}" width="80" height="80" style="object-fit:contain;" />` 
      : '';

    // Header
    const headerContent = `
      <table style="width: 100%; border-bottom: 3px double black; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
        <tr>
          <td style="width: 15%; vertical-align: middle; text-align: center; border: none;">${logoHtml}</td>
          <td style="width: 85%; text-align: center; vertical-align: middle; border: none;">
            <p style="margin:0; font-size: 14pt; font-weight: bold;">PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA</p>
            <p style="margin:0; font-size: 16pt; font-weight: bold;">${(data.schoolName || 'SEKOLAH').toUpperCase()}</p>
            <p style="margin:0; font-size: 10pt;">Jl. Pendidikan No. 1, Kota Pelajar, Indonesia</p>
          </td>
        </tr>
      </table>
      <div style="text-align: center; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
        <p style="margin:0; font-size: 12pt; font-weight: bold; text-decoration: underline;">${(data.title || 'UJIAN').toUpperCase()}</p>
        <p style="margin:0; font-size: 10pt;">Tahun Pelajaran ${new Date().getFullYear()}/${new Date().getFullYear()+1}</p>
      </div>
    `;

    // Identity
    const identityContent = `
      <table style="width: 100%; font-family: 'Times New Roman', serif; font-size: 11pt; margin-bottom: 15px; border: none;">
        <tr>
          <td style="width: 15%; border: none;">Mata Pelajaran</td><td style="width: 2%; border: none;">:</td><td style="width: 40%; border: none;"><b>${safeSubject}</b></td>
          <td style="width: 15%; border: none;">Hari/Tanggal</td><td style="width: 2%; border: none;">:</td><td style="width: 26%; border: none;">....................</td>
        </tr>
        <tr>
          <td style="border: none;">Kelas/Semester</td><td style="border: none;">:</td><td style="border: none;">${data.grade} / ${data.semester}</td>
          <td style="border: none;">Waktu</td><td style="border: none;">:</td><td style="border: none;">90 Menit</td>
        </tr>
      </table>
    `;

    // Questions
    const mcqContent = data.multipleChoice.map((q, i) => `
      <div style="margin-bottom: 10px; page-break-inside: avoid;">
        <table style="width: 100%; vertical-align: top; border: none;">
          <tr>
            <td style="width: 30px; vertical-align: top; border: none;">${i+1}.</td>
            <td style="border: none;">${q.question}</td>
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
        <table style="width: 100%; vertical-align: top; border: none;">
          <tr>
            <td style="width: 30px; vertical-align: top; border: none;">${i+1}.</td>
            <td style="border: none;">${q.question}</td>
          </tr>
        </table>
      </div>
    `).join('');

    // Signature
    const signatureContent = `
      <table style="width: 100%; margin-top: 30px; page-break-inside: avoid; text-align: center; border: none;">
        <tr>
          <td style="width: 40%; border: none;">
            Mengetahui,<br/>Kepala Sekolah<br/><br/><br/><br/>
            <b><u>${data.headmasterName}</u></b><br/>
            NIP. ${data.headmasterNIP}
          </td>
          <td style="width: 20%; border: none;"></td>
          <td style="width: 40%; border: none;">
            Jakarta, ${data.date || '....................'}<br/>Guru Mata Pelajaran<br/><br/><br/><br/>
            <b><u>${data.teacherName}</u></b><br/>
            NIP. ${data.teacherNIP}
          </td>
        </tr>
      </table>
    `;

    // Key & Grid
    const keyContent = `
      <br clear="all" style="page-break-before:always" />
      <h2 style="text-align:center;">KUNCI JAWABAN</h2>
      <h3>A. PILIHAN GANDA</h3>
      <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse; text-align: center; border: 1px solid black;">
        ${Array.from({ length: Math.ceil(data.multipleChoice.length / 5) }).map((_, rowIdx) => `
          <tr>
            ${data.multipleChoice.slice(rowIdx * 5, (rowIdx + 1) * 5).map((q, colIdx) => `
              <td style="width: 20%; border: 1px solid black;"><b>${(rowIdx * 5) + colIdx + 1}. ${q.correctAnswer}</b></td>
            `).join('')}
          </tr>
        `).join('')}
      </table>
      
      <h3>B. URAIAN & PEDOMAN PENSKORAN</h3>
      <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse; border: 1px solid black;">
        <tr style="background-color: #eee;">
          <th style="width: 50px; border: 1px solid black;">No</th>
          <th style="border: 1px solid black;">Jawaban & Pedoman</th>
        </tr>
        ${data.essay.map((q, i) => `
          <tr>
            <td style="text-align: center; vertical-align: top; border: 1px solid black;">${i+1}</td>
            <td style="white-space: pre-wrap; border: 1px solid black;">${q.answerKey}</td>
          </tr>
        `).join('')}
      </table>
    `;

    const gridContent = `
      <br clear="all" style="page-break-before:always" />
      <h2 style="text-align:center;">KISI-KISI PENULISAN SOAL</h2>
      <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 10pt;">
        <tr style="background-color: #cccccc; text-align: center; font-weight: bold;">
          <th style="width: 5%; border: 1px solid black;">No</th>
          <th style="width: 20%; border: 1px solid black;">Capaian Pembelajaran</th>
          <th style="width: 20%; border: 1px solid black;">Materi</th>
          <th style="width: 35%; border: 1px solid black;">Indikator Soal</th>
          <th style="width: 10%; border: 1px solid black;">Bentuk</th>
          <th style="width: 10%; border: 1px solid black;">No. Soal</th>
        </tr>
        ${data.multipleChoice.map((q, i) => `
          <tr>
            <td style="text-align: center; border: 1px solid black;">${i + 1}</td>
            <td style="border: 1px solid black;">${q.cp || '-'}</td>
            <td style="border: 1px solid black;">${q.material || '-'}</td>
            <td style="border: 1px solid black;">${q.indicator || '-'}</td>
            <td style="text-align: center; border: 1px solid black;">PG</td>
            <td style="text-align: center; border: 1px solid black;">${i + 1}</td>
          </tr>
        `).join('')}
        ${data.essay.map((q, i) => `
          <tr>
            <td style="text-align: center; border: 1px solid black;">${data.multipleChoice.length + i + 1}</td>
            <td style="border: 1px solid black;">${q.cp || '-'}</td>
            <td style="border: 1px solid black;">${q.material || '-'}</td>
            <td style="border: 1px solid black;">${q.indicator || '-'}</td>
            <td style="text-align: center; border: 1px solid black;">Uraian</td>
            <td style="text-align: center; border: 1px solid black;">${i + 1}</td>
          </tr>
        `).join('')}
      </table>
    `;

    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${data.title}</title>
      <style>
        @page { size: 8.5in 14in; margin: 1in; } 
        body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000000; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid black; } 
        .no-border td { border: none !important; } 
        p { margin: 0; padding: 0; }
      </style>
      </head><body>
      ${headerContent}
      ${identityContent}
      <div style="margin-bottom: 10px; border: 1px solid black; padding: 5px; font-size: 10pt;">
        <b>Petunjuk Umum:</b><br/>1. Berdoa sebelum mengerjakan.<br/>2. Periksa kelengkapan soal.
      </div>
      <h3>A. PILIHAN GANDA</h3>
      ${mcqContent}
      <h3>B. URAIAN</h3>
      ${essayContent}
      ${signatureContent}
      ${showKey ? keyContent : ''}
      ${showGrid ? gridContent : ''}
      </body></html>`;
    
    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.title.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Updates
  const updateMeta = (field: keyof ExamData, value: any) => {
    setEditableData({ ...editableData, [field]: value });
  };

  const updateMCQ = (idx: number, field: keyof QuestionMCQ, value: any) => {
    const newMCQ = [...editableData.multipleChoice];
    newMCQ[idx] = { ...newMCQ[idx], [field]: value };
    setEditableData({ ...editableData, multipleChoice: newMCQ });
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    const newMCQ = [...editableData.multipleChoice];
    const newOptions = [...newMCQ[qIdx].options];
    newOptions[optIdx] = value;
    newMCQ[qIdx] = { ...newMCQ[qIdx], options: newOptions };
    setEditableData({ ...editableData, multipleChoice: newMCQ });
  };

  const updateEssay = (idx: number, field: keyof QuestionEssay, value: any) => {
    const newEssay = [...editableData.essay];
    newEssay[idx] = { ...newEssay[idx], [field]: value };
    setEditableData({ ...editableData, essay: newEssay });
  };

  return (
    <div className="w-full max-w-[216mm] mx-auto transition-all duration-500">
      
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-4 z-30 no-print">
        <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-0">
           <button 
             onClick={() => setShowKey(!showKey)}
             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${showKey ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
           >
             {showKey ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
             {showKey ? 'Hide Kunci' : 'Show Kunci'}
           </button>
           <button 
             onClick={() => setShowGrid(!showGrid)}
             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${showGrid ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
           >
             {showGrid ? <Grid className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
             {showGrid ? 'Hide Kisi-Kisi' : 'Show Kisi-Kisi'}
           </button>
           <button 
             onClick={() => setIsEditing(!isEditing)}
             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isEditing ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400' : 'bg-gray-100 text-gray-600'}`}
           >
             {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
             {isEditing ? 'Selesai Edit' : 'Edit Mode'}
           </button>
        </div>
        
        <div className="flex items-center gap-2">
           <button onClick={handleExportWord} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md" title="Download file .doc">
             <FileType className="w-3.5 h-3.5" /> Word
           </button>
           
           <button 
             onClick={handleDownloadPDF} 
             disabled={isGeneratingPdf}
             className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-md disabled:opacity-50"
             title="Download file .pdf secara langsung"
           >
             {isGeneratingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin"/> : <FileDown className="w-3.5 h-3.5" />}
             {isGeneratingPdf ? 'Memproses...' : 'Download PDF'}
           </button>

           <button onClick={handleNativePrint} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300" title="Buka Dialog Print Browser">
             <Printer className="w-3.5 h-3.5" /> Cetak (Browser)
           </button>
        </div>
      </div>

      {/* PAPER PREVIEW AREA */}
      <div id="exam-print-area" className="bg-white text-black shadow-2xl min-h-[297mm] p-[20mm] print:shadow-none print:p-0 print:w-full">
        
        {/* KOP SURAT */}
        <div className="border-b-4 double-border border-black mb-6 pb-4 flex items-center gap-6">
           {editableData.logoUrl && (
             <img 
               src={editableData.logoUrl} 
               alt="Logo" 
               className="w-24 h-24 object-contain" 
               crossOrigin="anonymous"
             />
           )}
           <div className="text-center flex-1">
             <h3 className="text-lg font-bold font-serif text-black">PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA</h3>
             {isEditing ? (
               <input 
                 className="text-2xl font-bold font-serif tracking-wide text-black text-center w-full border-b border-blue-300 focus:outline-none"
                 value={editableData.schoolName}
                 onChange={(e) => updateMeta('schoolName', e.target.value)}
               />
             ) : (
               <h2 className="text-2xl font-bold font-serif tracking-wide text-black">{editableData.schoolName?.toUpperCase()}</h2>
             )}
             <p className="text-sm font-serif text-black">Jl. Pendidikan No. 1, Kota Pelajar, Indonesia</p>
           </div>
        </div>

        <div className="text-center mb-6 font-serif text-black">
          {isEditing ? (
            <input 
              className="text-xl font-bold uppercase text-center w-full border-b border-blue-300 focus:outline-none mb-1"
              value={editableData.title}
              onChange={(e) => updateMeta('title', e.target.value)}
            />
          ) : (
            <h1 className="text-xl font-bold uppercase underline decoration-2 underline-offset-4">{editableData.title}</h1>
          )}
          <p className="mt-1">Tahun Pelajaran {new Date().getFullYear()}/{new Date().getFullYear()+1}</p>
        </div>

        {/* IDENTITAS */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-6 font-serif text-sm text-black">
           <div className="flex">
             <span className="w-32">Mata Pelajaran</span>
             <span className="mr-2">:</span>
             {isEditing ? (
               <input 
                 className="font-bold flex-1 border-b border-blue-300 focus:outline-none"
                 value={editableData.subject}
                 onChange={(e) => updateMeta('subject', e.target.value)}
               />
             ) : (
               <span className="font-bold">{editableData.subject}</span>
             )}
           </div>
           <div className="flex">
             <span className="w-32">Hari/Tanggal</span>
             <span className="mr-2">:</span>
             <span>........................................</span>
           </div>
           <div className="flex">
             <span className="w-32">Kelas / Semester</span>
             <span className="mr-2">:</span>
             <span>{editableData.grade} / {editableData.semester}</span>
           </div>
           <div className="flex">
             <span className="w-32">Waktu</span>
             <span className="mr-2">:</span>
             <span>90 Menit</span>
           </div>
        </div>

        <div className="border border-black p-2 mb-6 text-sm font-serif text-black">
           <b>Petunjuk Umum:</b>
           <ol className="list-decimal list-inside">
             <li>Berdoalah sebelum mengerjakan soal.</li>
             <li>Periksa dan bacalah soal-soal sebelum Anda menjawabnya.</li>
             <li>Laporkan kepada pengawas ujian apabila terdapat lembar soal yang kurang jelas, rusak, atau tidak lengkap.</li>
           </ol>
        </div>

        {/* SOAL PG */}
        <div className="mb-8 font-serif text-black">
           <h3 className="font-bold mb-4">A. PILIHAN GANDA</h3>
           <div className="space-y-4">
             {editableData.multipleChoice.map((q, i) => (
               /* page-break-inside-avoid prevents the question from being cut in half */
               <div key={q.id} className="flex gap-2 page-break-inside-avoid break-inside-avoid">
                  <span className="font-bold min-w-[24px]">{i+1}.</span>
                  <div className="flex-1">
                    {isEditing ? (
                      <textarea 
                        className="w-full border border-gray-300 rounded p-2 text-sm mb-2 focus:ring-2 focus:ring-blue-200 outline-none text-black"
                        value={q.question}
                        onChange={(e) => updateMCQ(i, 'question', e.target.value)}
                        rows={2}
                      />
                    ) : (
                      <p className="mb-2 text-justify">{q.question}</p>
                    )}
                    
                    <div className="ml-2 space-y-1">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-2">
                          <span className="font-medium min-w-[16px]">{String.fromCharCode(65+oIdx)}.</span>
                          {isEditing ? (
                             <input 
                               className="flex-1 border-b border-gray-300 text-sm focus:border-blue-500 outline-none px-1 text-black"
                               value={opt}
                               onChange={(e) => updateOption(i, oIdx, e.target.value)}
                             />
                          ) : (
                             <span>{opt}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
             ))}
           </div>
        </div>

        {/* SOAL ESSAY */}
        <div className="mb-12 font-serif text-black">
           <h3 className="font-bold mb-4">B. URAIAN</h3>
           <div className="space-y-6">
             {editableData.essay.map((q, i) => (
               <div key={q.id} className="flex gap-2 page-break-inside-avoid break-inside-avoid">
                  <span className="font-bold min-w-[24px]">{i+1}.</span>
                  <div className="flex-1">
                    {isEditing ? (
                      <textarea 
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none text-black"
                        value={q.question}
                        onChange={(e) => updateEssay(i, 'question', e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <p className="text-justify">{q.question}</p>
                    )}
                  </div>
               </div>
             ))}
           </div>
        </div>

        {/* TTD */}
        <div className="flex justify-between mt-12 pt-8 font-serif page-break-inside-avoid break-inside-avoid text-black">
           <div className="text-center">
              <p>Mengetahui,</p>
              <p className="mb-16">Kepala Sekolah</p>
              {isEditing ? (
                <input 
                   className="font-bold underline text-center w-full border-b border-blue-300 focus:outline-none"
                   value={editableData.headmasterName}
                   onChange={(e) => updateMeta('headmasterName', e.target.value)}
                />
              ) : (
                <p className="font-bold underline">{editableData.headmasterName}</p>
              )}
              <p>NIP. {editableData.headmasterNIP}</p>
           </div>
           <div className="text-center">
              <p>Jakarta, {editableData.date || '....................'}</p>
              <p className="mb-16">Guru Mata Pelajaran</p>
              {isEditing ? (
                 <input 
                    className="font-bold underline text-center w-full border-b border-blue-300 focus:outline-none"
                    value={editableData.teacherName}
                    onChange={(e) => updateMeta('teacherName', e.target.value)}
                 />
              ) : (
                 <p className="font-bold underline">{editableData.teacherName}</p>
              )}
              <p>NIP. {editableData.teacherNIP}</p>
           </div>
        </div>

        {/* KUNCI JAWABAN (FORCE PAGE BREAK BEFORE) */}
        {showKey && (
          <div className="mt-12 pt-12 border-t-2 border-dashed border-gray-300 page-break-before text-black">
             <div className="text-center mb-8 font-serif">
               <h2 className="text-xl font-bold underline">KUNCI JAWABAN</h2>
             </div>
             
             <div className="mb-8 font-serif text-black">
                <h3 className="font-bold mb-4">A. PILIHAN GANDA</h3>
                <div className="grid grid-cols-5 gap-2 text-sm">
                  {editableData.multipleChoice.map((q, i) => (
                    <div key={i} className="border border-black p-1 text-center text-black print-border">
                      <span className="font-bold">{i+1}. {q.correctAnswer}</span>
                    </div>
                  ))}
                </div>
             </div>

             <div className="mb-8 font-serif text-black">
                <h3 className="font-bold mb-4">B. URAIAN & PEDOMAN PENSKORAN</h3>
                <div className="space-y-4">
                    {editableData.essay.map((q, i) => (
                        <div key={i} className="border border-black p-4 text-sm page-break-inside-avoid break-inside-avoid print-border">
                            <div className="font-bold mb-1">Soal No. {i+1}</div>
                            <div className="whitespace-pre-wrap">{q.answerKey}</div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        )}

        {/* KISI-KISI (FORCE PAGE BREAK BEFORE) */}
        {showGrid && (
            <div className="mt-12 pt-12 border-t-2 border-dashed border-gray-300 page-break-before text-black text-base">
                <div className="text-center mb-8 font-serif">
                   <h2 className="text-xl font-bold underline text-black">KISI-KISI PENULISAN SOAL</h2>
                </div>
                
                <table className="w-full border-collapse border border-black text-xs font-serif text-black print-border">
                    <thead>
                        {/* Using inline style for color to force print output black */}
                        <tr className="bg-gray-100 text-black print-border" style={{color: '#000000', backgroundColor: '#f3f4f6'}}>
                            <th className="border border-black p-2 text-center w-10 text-black print-border" style={{color: 'black'}}>No</th>
                            <th className="border border-black p-2 text-left text-black print-border" style={{color: 'black'}}>Capaian Pembelajaran</th>
                            <th className="border border-black p-2 text-left text-black print-border" style={{color: 'black'}}>Materi</th>
                            <th className="border border-black p-2 text-left text-black print-border" style={{color: 'black'}}>Indikator Soal</th>
                            <th className="border border-black p-2 text-center w-20 text-black print-border" style={{color: 'black'}}>Bentuk</th>
                            <th className="border border-black p-2 text-center w-16 text-black print-border" style={{color: 'black'}}>No. Soal</th>
                        </tr>
                    </thead>
                    <tbody className="text-black">
                        {editableData.multipleChoice.map((q, i) => (
                            <tr key={`mcq-${i}`} className="page-break-inside-avoid break-inside-avoid">
                                <td className="border border-black p-2 text-center text-black print-border" style={{color: 'black'}}>{i+1}</td>
                                <td className="border border-black p-2 text-black print-border" style={{color: 'black'}}>{q.cp}</td>
                                <td className="border border-black p-2 text-black print-border" style={{color: 'black'}}>{q.material}</td>
                                <td className="border border-black p-2 text-black print-border" style={{color: 'black'}}>{q.indicator}</td>
                                <td className="border border-black p-2 text-center text-black print-border" style={{color: 'black'}}>PG</td>
                                <td className="border border-black p-2 text-center text-black print-border" style={{color: 'black'}}>{i+1}</td>
                            </tr>
                        ))}
                        {editableData.essay.map((q, i) => (
                            <tr key={`essay-${i}`} className="page-break-inside-avoid break-inside-avoid">
                                <td className="border border-black p-2 text-center text-black print-border" style={{color: 'black'}}>{editableData.multipleChoice.length + i + 1}</td>
                                <td className="border border-black p-2 text-black print-border" style={{color: 'black'}}>{q.cp}</td>
                                <td className="border border-black p-2 text-black print-border" style={{color: 'black'}}>{q.material}</td>
                                <td className="border border-black p-2 text-black print-border" style={{color: 'black'}}>{q.indicator}</td>
                                <td className="border border-black p-2 text-center text-black print-border" style={{color: 'black'}}>Uraian</td>
                                <td className="border border-black p-2 text-center text-black print-border" style={{color: 'black'}}>{i+1}</td>
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