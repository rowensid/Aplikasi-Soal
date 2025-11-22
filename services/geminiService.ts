import { GoogleGenAI, Type } from "@google/genai";
import { ExamData, GeneratorConfig, SchoolLevel } from '../types';
import { CURRICULUM_CONTEXT } from './curriculumData';

// ROBUST ENV HANDLING:
// Check both standard process.env (Node/CRA) and import.meta.env (Vite/Vercel)
// Vercel requires 'VITE_' prefix for variables exposed to the browser.
const getEnvVar = (key: string, viteKey: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    // @ts-ignore
    return import.meta.env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

const API_KEY = getEnvVar('API_KEY', 'VITE_API_KEY');

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

export const generateExam = async (config: GeneratorConfig): Promise<ExamData> => {
  if (!API_KEY) {
    throw new Error("API KEY Missing. Please check Vercel Environment Variables (VITE_API_KEY).");
  }

  // gemini-2.5-flash is suitable for high-volume text generation tasks with good reasoning
  const modelId = 'gemini-2.5-flash';
  
  // Helper to format date like "Jakarta, 20 Mei 2024"
  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = new Date().toLocaleDateString('id-ID', dateOptions);

  // Dynamic Prompt Construction based on School Level
  const subject = config.subject || "Mata Pelajaran Umum";
  const level = config.schoolLevel || SchoolLevel.SMA;
  
  // 1. Resolve Specific Curriculum Data
  let curriculumContext = "";
  const gradeData = CURRICULUM_CONTEXT[config.grade];
  if (gradeData) {
    curriculumContext = gradeData[config.semester] || "";
  }

  let audienceContext = "";
  let specificConstraints = "";

  if (level === SchoolLevel.SMP) {
    audienceContext = "Target Audience: Siswa SMP (Fase D Kurikulum Merdeka). Use simpler language appropriate for 12-15 year olds.";
  } else if (level === SchoolLevel.SMK) {
    audienceContext = `Target Audience: Siswa SMK (Sekolah Menengah Kejuruan). Context: **Vocational/Industrial**. 
    For productive subjects (e.g., TKJ, RPL, Otomotif, PKK), focus on practical case studies, troubleshooting, and industrial standards.`;
  } else {
    audienceContext = "Target Audience: Siswa SMA (Fase E/F Kurikulum Merdeka). Focus on Academic and Scientific reasoning.";
  }

  // FIX: Ensure PKK/Mulok are treated as written exams with grids
  if (subject.toLowerCase().includes('pkk') || subject.toLowerCase().includes('kewirausahaan')) {
    specificConstraints = `
      SPECIAL INSTRUCTION FOR PKK (Kewirausahaan):
      - Although this is a vocational subject, you MUST generate a **Standard Written Theory Exam** (Ujian Tulis).
      - Focus on Theory: Business Planning, Cost Calculation (HPP), Marketing Strategy, SWOT Analysis, IPR (HAKI).
      - Do NOT generate practical checklists. 
      - MANDATORY: You must fill the 'cp' (Capaian Pembelajaran), 'atp', and 'indicator' fields for every question. Do not leave them blank.
    `;
  } else if (subject.toLowerCase().includes('mulok') || subject.toLowerCase().includes('muatan lokal')) {
     specificConstraints = `
      SPECIAL INSTRUCTION FOR MULOK:
      - Treat this as a formal academic subject about Local Wisdom, Culture, or Specific Regional Skills.
      - MANDATORY: Generate full 'cp', 'atp', and 'indicator' for the Grid.
    `;
  }

  const topicClause = config.topic 
    ? `FOKUS MATERI / TOPIK KHUSUS: "${config.topic}". (Pastikan 80% soal berfokus pada topik ini, sisanya materi pendukung yang relevan).` 
    : "CAKUPAN MATERI: Gunakan referensi kurikulum di bawah ini.";

  const prompt = `
    You are an expert **${subject}** teacher for Indonesian Schools (${level}) implementing **Kurikulum Merdeka**.
    Your task is to create a complete Exam Package (Soal + Kisi-kisi + Kunci Jawaban) for "Sumatif Akhir Semester".
    
    CONTEXT DATA:
    Grade: ${config.grade}
    Semester: ${config.semester}
    Subject: ${subject}
    ${audienceContext}
    ${specificConstraints}
    
    OFFICIAL CURRICULUM REFERENCE (Must Follow):
    ${curriculumContext}

    ${topicClause}

    Directives for Content Generation:
    1. **Kisi-kisi (Exam Grid)**: This is CRITICAL. For EVERY question, generate:
       - 'cp' (Capaian Pembelajaran): The broad competency standard. DO NOT leave empty.
       - 'atp' (Alur Tujuan Pembelajaran): The specific learning objective. DO NOT leave empty.
       - 'material' (Materi Esensial): The specific topic focus.
       - 'indicator' (Indikator Soal): Must be **OPERATIONAL** and specific. START with "Disajikan...".
       - **IMPORTANT**: Never leave these fields empty, even for vocational subjects. Create appropriate academic indicators.
    
    2. **Question Quality**:
       - Questions must use **HOTS** (Higher Order Thinking Skills) where appropriate.
       - Use stimulus (charts, data descriptions, case studies) relevant to ${subject}.
       - If SMK, ensure questions are practical and scenario-based.
       
    3. **Structure**:
       - ${config.mcqCount} Multiple Choice Questions (Options A-E).
       - ${config.essayCount} Essay Questions (Uraian).

    4. **Answer Keys (CRITICAL)**:
       - Multiple Choice: Just the letter.
       - **Essay (Uraian)**: You MUST provide the **FULL COMPLETE MODEL ANSWER**. 
         - **IMPORTANT**: Do NOT just write "Siswa menjawab dengan benar".
         - **REQUIRED FORMAT**: Write a 2-3 sentence model answer. Then, add a scoring guide (Pedoman Penskoran).

    5. **Formatting Rules**: 
       - **CLEAN TEXT ONLY**: Do NOT use Markdown formatting (like **bold**, *italic*, or lists) inside the JSON values. The output will be put into raw text inputs, so symbols look messy. Use newlines (\\n) for formatting.
       - **Options**: Do NOT include the letter prefix (e.g., "A.", "B.") in the option text. Just provide the answer text.
       - **CorrectAnswer**: Must be just the letter (A, B, C, D, or E).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            grade: { type: Type.STRING },
            semester: { type: Type.STRING },
            multipleChoice: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  cp: { type: Type.STRING },
                  atp: { type: Type.STRING },
                  material: { type: Type.STRING },
                  indicator: { type: Type.STRING }
                },
                required: ['id', 'question', 'options', 'correctAnswer', 'cp', 'atp', 'material', 'indicator']
              }
            },
            essay: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  answerKey: { type: Type.STRING },
                  cp: { type: Type.STRING },
                  atp: { type: Type.STRING },
                  material: { type: Type.STRING },
                  indicator: { type: Type.STRING }
                },
                required: ['id', 'question', 'answerKey', 'cp', 'atp', 'material', 'indicator']
              }
            }
          },
          required: ['title', 'subject', 'grade', 'semester', 'multipleChoice', 'essay']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Robust JSON Parsing: Handle potential markdown wrapping from AI
    const cleanText = text.replace(/```json\s*|```/g, '').trim();
    const parsedData = JSON.parse(cleanText);
    
    // Ensure subject is safe
    if (!parsedData.subject) {
        parsedData.subject = config.subject || "Ujian Sekolah";
    }

    return {
      ...parsedData,
      schoolName: config.schoolName,
      logoUrl: config.logoUrl,
      headmasterName: config.headmasterName,
      headmasterNIP: config.headmasterNIP,
      teacherName: config.teacherName,
      teacherNIP: config.teacherNIP,
      date: formattedDate
    } as ExamData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};