import api, { unwrap } from "../lib/api";
import type {
  AnswerResult, Dashboard, Difficulty, History, HistoryQuery, Interview, InterviewListItem, InterviewReport,
  PerformanceReport, Resume, ResumeAnalysis, Session, SessionStart, SessionState,
} from "../lib/types";

export const resumeService = {
  get: () => unwrap<Resume>(api.get("/resume")),
  upload: (file: File) => {
    const form = new FormData();
    form.append("resume", file);
    return unwrap<Resume>(api.post("/resume/upload", form, { headers: { "Content-Type": "multipart/form-data" } }));
  },
  replace: (file: File) => {
    const form = new FormData();
    form.append("resume", file);
    return unwrap<Resume>(api.patch("/resume", form, { headers: { "Content-Type": "multipart/form-data" } }));
  },
  remove: () => unwrap<null>(api.delete("/resume")),
  analyze: () => unwrap<ResumeAnalysis>(api.post("/resume/analysis")),
  analysis: () => unwrap<ResumeAnalysis>(api.get("/resume/analysis")),
};

export const interviewService = {
  create: (body: { role: string; experience: string; difficulty: Difficulty }) =>
    unwrap<Interview>(api.post("/interview/generate", body)),
  list: () => unwrap<InterviewListItem[]>(api.get("/interviews")),
  get: (id: string) => unwrap<{ interview: Interview; session: Session | null; report: InterviewReport | null }>(api.get(`/interview/${id}`)),
  remove: (id: string) => unwrap<null>(api.delete(`/interview/${id}`)),
  start: (interviewId: string) => unwrap<SessionStart>(api.post("/session/start", { interviewId })),
  session: (sessionId: string) => unwrap<SessionState>(api.get(`/session/${sessionId}`)),
  answer: (body: { sessionId: string; answerText: string; questionIndex: number }) => unwrap<AnswerResult>(api.post("/answer", body)),
  report: (sessionId: string) => unwrap<InterviewReport>(api.get(`/session/${sessionId}/report`)),
};

export const performanceService = {
  dashboard: () => unwrap<Dashboard>(api.get("/dashboard")),
  get: () => unwrap<PerformanceReport>(api.get("/performance")),
  generate: () => unwrap<PerformanceReport>(api.post("/performance/generate")),
  pdf: async () => (await api.get("/performance/pdf", { responseType: "blob" })).data as Blob,
  history: (q: HistoryQuery) =>
    unwrap<History>(api.get("/history", { params: { ...q, search: q.search || undefined, difficulty: q.difficulty || undefined, category: q.category || undefined } })),
};
