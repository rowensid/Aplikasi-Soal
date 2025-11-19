
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
  if (level === SchoolLevel.SMP) {
    audienceContext = "Target Audience: Siswa SMP (Fase D Kurikulum Merdeka). Use simpler language appropriate for 12-15 year olds.";
  } else if (level === SchoolLevel.SMK) {
    audienceContext = `Target Audience: Siswa SMK (Sekolah Menengah Kejuruan). Context: **Vocational/Industrial**. 
    For productive subjects (e.g., TKJ, RPL, Otomotif), focus on practical case studies, troubleshooting, and industrial standards. 
    For general subjects, relate them to the work environment where possible.`;
  } else {
    audienceContext = "Target Audience: Siswa SMA (Fase E/F Kurikulum Merdeka). Focus on Academic and Scientific reasoning.";
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
    
    OFFICIAL CURRICULUM REFERENCE (Must Follow):
    ${curriculumContext}

    ${topicClause}

    Directives for Content Generation:
    1. **Kisi-kisi (Exam Grid)**: This is CRITICAL. For EVERY question, generate:
       - 'cp' (Capaian Pembelajaran): The broad competency standard.
       - 'atp' (Alur Tujuan Pembelajaran): The specific learning objective.
       - 'material' (Materi Esensial): The specific topic focus.
       - 'indicator' (Indikator Soal): Must be **OPERATIONAL** and specific. START with "Disajikan...".
    
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
                  cp: { type: Type.STRING },
                  atp: { type: Type.STRING },
                  material: { type: Type.STRING },
                  indicator: { type: Type.STRING },
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
                  cp: { type: Type.STRING },
                  atp: { type: Type.STRING },
                  material: { type: Type.STRING },
                  indicator: { type: Type.STRING },
                },
                required: ["id", "question", "answerKey", "cp", "atp", "material", "indicator"]
              }
            }
          },
          required: ["title", "grade", "semester", "multipleChoice", "essay"]
        }
      }
    });

    if (response.text) {
      const parsedData = JSON.parse(response.text);
      // Inject user config and generated date into the data
      return {
        ...parsedData,
        subject: subject,
        schoolName: config.schoolName,
        logoUrl: config.logoUrl,
        headmasterName: config.headmasterName,
        headmasterNIP: config.headmasterNIP,
        teacherName: config.teacherName,
        teacherNIP: config.teacherNIP,
        date: formattedDate
      } as ExamData;
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Error generating exam:", error);
    throw error;
  }
};
