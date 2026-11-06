import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Lightbulb, Mic, MicOff, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AiProgress from "../components/AiProgress";
import Button from "../components/ui/Button";
import { Badge, ErrorNotice, Skeleton } from "../components/ui/Misc";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage, getStatus } from "../lib/api";
import type { Question } from "../lib/types";
import { cn } from "../lib/utils";
import { interviewService } from "../services/interview";

const MAX = 5000;

// Minimal typing for the (still vendor-prefixed) Web Speech API.
interface Recognition {
  continuous: boolean; interimResults: boolean; lang: string;
  start(): void; stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
}
const getRecognition = (): (new () => Recognition) | null => {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

interface Live { sessionId: string; index: number; total: number; question: Question; role?: string }

export default function Practice() {
  const { interviewId = "" } = useParams();
  useDocumentTitle("Interview");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();

  const [live, setLive] = useState<Live | null>(null);
  const [loadError, setLoadError] = useState("");
  const [answer, setAnswer] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [reportFailed, setReportFailed] = useState<{ sessionId: string; message: string } | null>(null);
  const startedFor = useRef<string | null>(null);

  const draftKey = live ? `draft:${live.sessionId}:${live.index}` : null;

  const goToReport = useCallback((sessionId: string) => {
    for (const k of ["interviews", "dashboard", "history", "performance"]) qc.invalidateQueries({ queryKey: [k] });
    navigate(`/reports/${sessionId}`, { replace: true });
  }, [navigate, qc]);

  // Start (or resume) the session. The backend call is idempotent, so a refresh just picks up where you left off.
  useEffect(() => {
    if (startedFor.current === interviewId) return;
    startedFor.current = interviewId;
    interviewService.start(interviewId)
      .then(async (s) => {
        if (!s.currentQuestion) return goToReport(s.session._id);
        const state = await interviewService.session(s.session._id);
        setLive({ sessionId: s.session._id, index: s.session.currentQuestionIndex, total: s.totalQuestions, question: s.currentQuestion, role: state.role });
      })
      .catch(async (e) => {
        if (getStatus(e) === 409) {
          // already completed: jump to its report
          try {
            const d = await interviewService.get(interviewId);
            if (d.session) return goToReport(d.session._id);
          } catch { /* fall through to the error */ }
        }
        setLoadError(getErrorMessage(e));
      });
  }, [interviewId, goToReport]);

  // Restore an unsent draft when the question changes or the page reloads.
  useEffect(() => {
    if (!draftKey) return;
    try { setAnswer(sessionStorage.getItem(draftKey) ?? ""); } catch { setAnswer(""); }
  }, [draftKey]);
  useEffect(() => {
    if (!draftKey) return;
    try { answer ? sessionStorage.setItem(draftKey, answer) : sessionStorage.removeItem(draftKey); } catch { /* storage unavailable */ }
  }, [answer, draftKey]);

  const submit = useMutation({
    mutationFn: (l: Live) => interviewService.answer({ sessionId: l.sessionId, answerText: answer.trim(), questionIndex: l.index }),
    onMutate: (l) => setFinishing(l.index + 1 >= l.total),
    onSuccess: (res, l) => {
      if (draftKey) try { sessionStorage.removeItem(draftKey); } catch { /* ignore */ }
      if (res.completed) {
        if (res.report) return goToReport(l.sessionId);
        setReportFailed({ sessionId: l.sessionId, message: res.reportError ?? "The report could not be generated." });
        return;
      }
      if (res.nextQuestion) {
        setAnswer("");
        setLive({ ...l, index: l.index + 1, question: res.nextQuestion });
      }
    },
    onError: async (e, l) => {
      setFinishing(false);
      if (getStatus(e) === 409) {
        // We're out of sync (double click, other tab): reload the real state instead of guessing.
        toast.error(getErrorMessage(e));
        try {
          const s = await interviewService.session(l.sessionId);
          if (s.session.status === "COMPLETED" || !s.currentQuestion) return goToReport(l.sessionId);
          setAnswer("");
          setLive({ sessionId: l.sessionId, index: s.session.currentQuestionIndex, total: s.totalQuestions, question: s.currentQuestion, role: s.role });
        } catch { /* keep the current screen */ }
      } else {
        toast.error(getErrorMessage(e));
      }
    },
  });

  const retryReport = useMutation({
    mutationFn: (sessionId: string) => interviewService.report(sessionId),
    onSuccess: (_r, sessionId) => goToReport(sessionId),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const send = () => {
    if (!live || submit.isPending || answer.trim().length === 0) return;
    submit.mutate(live);
  };

  // ───────── speech dictation (optional, only where the browser supports it) ─────────
  const Speech = getRecognition();
  const rec = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  const stopListening = useCallback(() => { rec.current?.stop(); setListening(false); }, []);
  useEffect(() => () => rec.current?.stop(), []);
  useEffect(() => { stopListening(); }, [live?.index, stopListening]);

  const toggleDictation = () => {
    if (listening) return stopListening();
    if (!Speech) return;
    const r = new Speech();
    r.continuous = true; r.interimResults = false; r.lang = navigator.language || "en-US";
    r.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript;
      if (text) setAnswer((a) => (a ? `${a.trimEnd()} ${text.trim()}` : text.trim()).slice(0, MAX));
    };
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); toast.error("Microphone unavailable. Check browser permissions."); };
    rec.current = r; r.start(); setListening(true);
  };

  // ───────── render ─────────
  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <ErrorNotice message={loadError} />
        <Link to="/interviews" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" /> Back to interviews</Link>
      </div>
    );
  }

  if (reportFailed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        {retryReport.isPending ? (
          <AiProgress title="Scoring your interview" steps={["Reading your answers", "Scoring each skill", "Writing feedback"]} hint="usually 15–60 seconds" />
        ) : (
          <div className="card space-y-4 p-6 text-center">
            <h1 className="text-2xl font-bold">All answers saved ✓</h1>
            <p className="text-muted">The AI couldn't finish your report this time ({reportFailed.message}). Nothing is lost — try again.</p>
            <Button size="lg" onClick={() => retryReport.mutate(reportFailed.sessionId)}>Generate my report</Button>
          </div>
        )}
      </div>
    );
  }

  if (!live) {
    return <div className="mx-auto max-w-3xl space-y-4 px-4 py-10" aria-busy><Skeleton className="h-6 w-48" /><Skeleton className="h-40 w-full" /><Skeleton className="h-48 w-full" /></div>;
  }

  if (finishing && submit.isPending) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <AiProgress title="Scoring your interview" steps={["Saving your last answer", "Reading all ten answers", "Scoring technical depth and communication", "Writing your feedback"]} hint="usually 15–60 seconds" />
      </div>
    );
  }

  const pct = Math.round((live.index / live.total) * 100);
  const isLast = live.index + 1 >= live.total;
  const empty = answer.trim().length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link to="/interviews" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"><ArrowLeft className="size-4" /> Exit (progress is saved)</Link>
          <span className="font-mono text-sm tabular-nums text-muted">{live.index + 1} / {live.total}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuenow={live.index} aria-valuemin={0} aria-valuemax={live.total} aria-label="Interview progress">
          <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <section className="card animate-fade-up p-6 sm:p-8" key={live.index} aria-live="polite">
        <div className="mb-4 flex items-center gap-2"><Badge tone="good">{live.question.category}</Badge>{live.role && <span className="text-xs text-muted">{live.role}</span>}</div>
        <h1 className="text-2xl font-semibold leading-snug sm:text-[1.7rem]">{live.question.question}</h1>
      </section>

      <section className="card p-5 sm:p-6">
        <label htmlFor="answer" className="mb-2 block text-sm font-medium">Your answer</label>
        <textarea
          id="answer" value={answer} rows={9} maxLength={MAX} disabled={submit.isPending}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); send(); } }}
          placeholder="Answer as you would in the real interview. Use concrete examples from your experience…"
          className="field-input resize-y leading-relaxed" autoFocus
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className={cn("tabular-nums", answer.length > MAX * 0.95 && "text-danger")}>{answer.length.toLocaleString()} / {MAX.toLocaleString()}</span>
            {Speech && (
              <button type="button" onClick={toggleDictation} aria-pressed={listening}
                className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium", listening ? "bg-danger-soft text-danger" : "bg-sunken hover:text-ink")}>
                {listening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />} {listening ? "Stop dictating" : "Dictate"}
              </button>
            )}
            <span className="hidden sm:inline">Ctrl + Enter to submit</span>
          </div>
          <Button size="lg" onClick={send} loading={submit.isPending} disabled={empty} icon={<Send className="size-4" />}>
            {isLast ? "Finish & get report" : "Submit & next"}
          </Button>
        </div>
      </section>

      <p className="flex items-start gap-2 text-sm text-muted"><Lightbulb className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
        <span>Aim for 80–150 words. For behavioural questions use Situation → Action → Result, and say what <em>you</em> did. Your draft is saved if you reload.</span></p>
    </div>
  );
}
