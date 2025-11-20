import { GoogleGenAI, Type } from "@google/genai";
import { ExamData, GeneratorConfig, SchoolLevel } from '../types';
import { CURRICULUM_CONTEXT } from './curriculumData';

// Initialize the API client with the key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExam = async (config: GeneratorConfig): Promise<ExamData> => {
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
       - **CorrectAnswer**: Just the letter (e.g., "A", "B").
       - **Output**: Strictly valid JSON. 
       - Language: Formal Indonesian (Ejaan Yang Disempurnakan).

    Generate the full exam package now.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // We leave maxOutputTokens flexible to ensure full exam generation
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: `Formal title, e.g., 'SUMATIF AKHIR SEMESTER ${subject.toUpperCase()}'` },
            grade: { type: Type.STRING },
            semester: { type: Type.STRING },
            multipleChoice: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING, description: "Plain text only, no markdown." },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Array of 5 strings. Do NOT include 'A.' or 'B.' prefixes. Plain text only."
                  },
                  correctAnswer: { type: Type.STRING, description: "Just the letter, e.g., 'A'" },
                  cp: { type: Type.STRING, description: "Capaian Pembelajaran (Fill with relevant competency)" },
                  atp: { type: Type.STRING, description: "Alur Tujuan Pembelajaran (Fill with specific objective)" },
                  material: { type: Type.STRING, description: "Materi (Must be filled)" },
                  indicator: { type: Type.STRING, description: "Indikator Soal (Must be filled)" },
                },
                required: ["id", "question", "options", "correctAnswer", "cp", "atp", "material", "indicator"]
              }
            },
            essay: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING, description: "Plain text only." },
                  answerKey: { type: Type.STRING, description: "Full answer + Rubric. Use newlines for structure. Plain text only, no markdown." },
                  cp: { type: Type.STRING, description: "Capaian Pembelajaran (Fill with relevant competency)" },
                  atp: { type: Type.STRING, description: "Alur Tujuan Pembelajaran (Fill with specific objective)" },
                  material: { type: Type.STRING, description: "Materi (Must be filled)" },
                  indicator: { type: Type.STRING, description: "Indikator Soal (Must be filled)" },
                },
                required: ["id", "question", "answerKey", "cp", "atp", "material", "indicator"]
              }
            }
          },
          required: ["title", "grade", "semester", "multipleChoice", "essay"]
        }
      }
    });

    // Parse response strictly
    let text = response.text;
    if (!text) throw new Error("No response text generated");
    
    // Clean Markdown wrapper if present (sometimes AI adds ```json ... ```)
    // Improved regex to handle cases where newline might be missing
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const examData = JSON.parse(text);

    // Inject manual data that the AI doesn't know about
    return {
      ...examData,
      subject: config.subject || "Mata Pelajaran", // Fallback string to prevent undefined errors
      schoolName: config.schoolName,
      schoolLevel: config.schoolLevel,
      logoUrl: config.logoUrl,
      headmasterName: config.headmasterName,
      headmasterNIP: config.headmasterNIP,
      teacherName: config.teacherName,
      teacherNIP: config.teacherNIP,
      date: formattedDate
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};