
export enum SchoolLevel {
  SMP = 'SMP',
  SMA = 'SMA',
  SMK = 'SMK'
}

export enum GradeLevel {
  // SMP
  VII = 'VII (7)',
  VIII = 'VIII (8)',
  IX = 'IX (9)',
  // SMA / SMK
  X = 'X (10)',
  XI = 'XI (11)',
  XII = 'XII (12)'
}

export enum Semester {
  GANJIL = '1 (Ganjil)',
  GENAP = '2 (Genap)'
}

export interface QuestionMetadata {
  cp: string; // Capaian Pembelajaran
  atp: string; // Alur Tujuan Pembelajaran
  material: string; // Materi Esensial
  indicator: string; // Indikator Soal
}

export interface QuestionMCQ extends QuestionMetadata {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuestionEssay extends QuestionMetadata {
  id: number;
  question: string;
  answerKey: string;
}

export interface ExamData {
  title: string;
  subject: string;
  grade: string;
  semester: string;
  schoolName?: string;
  logoUrl?: string;
  headmasterName?: string;
  headmasterNIP?: string;
  teacherName?: string;
  teacherNIP?: string;
  date?: string; 
  multipleChoice: QuestionMCQ[];
  essay: QuestionEssay[];
}

export interface GeneratorConfig {
  subject: string;
  topic?: string;
  grade: GradeLevel;
  semester: Semester;
  schoolName: string;
  schoolLevel: SchoolLevel;
  logoUrl: string;
  headmasterName: string;
  headmasterNIP: string;
  teacherName: string;
  teacherNIP: string;
  // New Configs
  mcqCount: number;
  essayCount: number;
}

export interface SchoolProfile {
  id: string;
  name: string;
  level: SchoolLevel;
  logoUrl: string;
  headmasterName: string;
  headmasterNIP: string;
  address?: string;
}

export interface Subject {
  id: string;
  name: string;
  levels: SchoolLevel[];
}

export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  role: UserRole;
  name: string;
}
