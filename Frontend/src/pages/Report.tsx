import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AiProgress from "../components/AiProgress";
import { BulletList } from "../components/Chips";
import { ScoreBar, ScoreRing } from "../components/Score";
import { buttonClass } from "../components/ui/Button";
import { Badge, ErrorNotice, Skeleton } from "../components/ui/Misc";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage, getStatus } from "../lib/api";
import { formatDate } from "../lib/utils";
import { interviewService } from "../services/interview";

export default function Report() {
  const { sessionId = "" } = useParams();
  useDocumentTitle("Interview report");

  const report = useQuery({ queryKey: ["report", sessionId], queryFn: () => interviewService.report(sessionId), retry: false });
  const interviewId = report.data?.interviewId;
  const detail = useQuery({ queryKey: ["interview", interviewId], queryFn: () => interviewService.get(interviewId!), enabled: !!interviewId });
  const r = report.data;
  const iv = detail.data?.interview;

  if (report.isPending) {
    return <div className="mx-auto max-w-4xl px-4 py-10"><AiProgress title="Loading your report" steps={["Fetching your report", "Generating it if needed"]} /></div>;
  }
  if (report.isError || !r) {
    const notFinished = getStatus(report.error) === 409;
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <ErrorNotice message={getErrorMessage(report.error)} onRetry={notFinished ? undefined : () => report.refetch()} />
        <Link to="/interviews" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" /> Back to interviews</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <Link to="/interviews" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"><ArrowLeft className="size-4" /> All interviews</Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Interview report</p>
        {iv ? (
          <>
            <h1 className="mt-1 text-3xl font-bold">{iv.role}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted"><Badge>{iv.difficulty}</Badge><Badge>{iv.experience}</Badge><span>{formatDate(r.createdAt)}</span></div>
          </>
        ) : detail.isPending ? <Skeleton className="mt-2 h-9 w-72" /> : <h1 className="mt-1 text-3xl font-bold">Your interview</h1>}
      </header>

      <section className="card grid gap-8 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center animate-fade-up" aria-label="Scores">
        <div className="flex items-center justify-center gap-6">
          <ScoreRing score={r.overallScore} size={150} label="Overall" />
          <ScoreRing score={r.interviewReadiness} size={104} label="Readiness" />
        </div>
        <div className="space-y-4">
          <ScoreBar label="Technical knowledge" value={r.technicalScore} />
          <ScoreBar label="Communication" value={r.communicationScore} />
          <ScoreBar label="Problem solving" value={r.problemSolvingScore} />
          <ScoreBar label="Confidence" value={r.confidenceScore} />
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Feedback</h2>
        <p className="mt-2 whitespace-pre-line leading-relaxed text-muted">{r.feedback}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-6"><h2 className="mb-3 text-lg font-semibold">Strengths</h2><BulletList items={r.strengths} tone="good" /></section>
        <section className="card p-6"><h2 className="mb-3 text-lg font-semibold">To work on</h2><BulletList items={r.weaknesses} tone="bad" /></section>
      </div>

      <section className="card p-6 sm:p-8">
        <h2 className="mb-3 text-lg font-semibold">What to do next</h2>
        <BulletList items={r.recommendations} />
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/interviews" className={buttonClass("primary")}>Practise again <ArrowRight className="size-4" /></Link>
        <Link to="/performance" className={buttonClass("secondary")}><Download className="size-4" /> Update performance report</Link>
      </div>
    </div>
  );
}
