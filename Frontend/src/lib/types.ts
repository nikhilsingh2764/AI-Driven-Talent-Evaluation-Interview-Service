export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
export interface FieldError { field: string; message: string }

export interface User {
  id: string;
  username: string;
  email: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Category = "Technical" | "Behavioral" | "System Design" | "HR";
export const CATEGORIES: Category[] = ["Technical", "Behavioral", "System Design", "HR"];
export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export interface Resume {
  _id: string;
  fileName: string;
  resumeUrl: string;
  storage: "cloudinary" | "local";
  textLength: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeAnalysis {
  _id: string;
  resumeId: string;
  summary: string;
  technicalSkills: string[];
  softSkills: string[];
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendedRoles: string[];
  improvementSuggestions: string[];
  atsScore: number;
  updatedAt: string;
}

export interface Question { question: string; category: Category }

export interface Interview {
  _id: string;
  role: string;
  experience: string;
  difficulty: Difficulty;
  status: "CREATED" | "STARTED" | "COMPLETED";
  questions: Question[];
  createdAt: string;
}

export interface InterviewListItem {
  id: string;
  role: string;
  experience: string;
  difficulty: Difficulty;
  status: "CREATED" | "STARTED" | "COMPLETED";
  totalQuestions: number;
  createdAt: string;
  sessionId: string | null;
  sessionStatus: "STARTED" | "COMPLETED" | null;
  answered: number;
  overallScore: number | null;
}

export interface Session {
  _id: string;
  interviewId: string;
  currentQuestionIndex: number;
  status: "STARTED" | "COMPLETED";
}

export interface SessionStart {
  session: Session;
  currentQuestion: Question | null;
  totalQuestions: number;
  resumed: boolean;
}

export interface SessionState {
  session: Session;
  currentQuestion: Question | null;
  totalQuestions: number;
  role: string;
  difficulty: Difficulty;
}

export interface InterviewReport {
  _id: string;
  sessionId: string;
  interviewId: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  recommendations: string[];
  interviewReadiness: number;
  createdAt: string;
}

export interface AnswerResult {
  completed: boolean;
  nextQuestion?: Question;
  report?: InterviewReport | null;
  reportError?: string | null;
  progress: { answered: number; total: number };
}

export interface PerformanceReport {
  overallProgress: number;
  technicalProgress: number;
  communicationProgress: number;
  problemSolvingProgress: number;
  confidenceProgress: number;
  strongestSkill: string;
  weakestSkill: string;
  improvementAreas: string[];
  studyPlan: string[];
  summary: string;
  interviewReadiness: number;
  totalInterviews: number;
  updatedAt: string;
}

export interface HistoryItem {
  reportId: string;
  interviewId: string;
  sessionId: string;
  role: string | null;
  experience: string | null;
  difficulty: Difficulty | null;
  overallScore: number;
  interviewReadiness: number;
  createdAt: string;
}

export interface History {
  items: HistoryItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HistoryQuery {
  page: number;
  limit: number;
  search: string;
  difficulty: "" | Difficulty;
  category: "" | Category;
  sort: "latest" | "oldest" | "highest-score" | "lowest-score";
}

export interface Dashboard {
  dashboardStats: { totalInterviews: number; averageScore: number; overallProgress: number; interviewReadiness: number };
  progressChart: {
    overallProgress: number;
    technicalProgress: number;
    communicationProgress: number;
    problemSolvingProgress: number;
    confidenceProgress: number;
  } | null;
  interviewHistory: {
    interviewId: string;
    sessionId: string;
    role: string | null;
    difficulty: Difficulty | null;
    overallScore: number;
    interviewReadiness: number;
    createdAt: string;
  }[];
  resumeAnalysis: ResumeAnalysis | null;
  performanceReportOutdated: boolean;
}
