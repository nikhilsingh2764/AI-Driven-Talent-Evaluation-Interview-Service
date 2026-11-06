import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, LineChart as LineIcon, RefreshCw, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AiProgress from "../components/AiProgress";
import { BulletList } from "../components/Chips";
import { SkillRadar } from "../components/charts";
import PageHeader from "../components/PageHeader";
import { ScoreBar, ScoreRing } from "../components/Score";
import Button, { buttonClass } from "../components/ui/Button";
import { EmptyState, ErrorNotice, Skeleton } from "../components/ui/Misc";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage, getStatus } from "../lib/api";
import { downloadBlob, formatDate } from "../lib/utils";
import { performanceService } from "../services/interview";

export default function Performance() {
  useDocumentTitle("Performance");
  const qc = useQueryClient();
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  const report = useQuery({
    queryKey: ["performance"],
    queryFn: () => performanceService.get().catch((e) => (getStatus(e) === 404 ? null : Promise.reject(e))),
  });
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: performanceService.dashboard });

  const generate = useMutation({
    mutationFn: performanceService.generate,
    onSuccess: (data) => {
      qc.setQueryData(["performance"], data);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Performance report updated.");
    },
  });

  const download = async () => {
    setDownloading(true);
    try { downloadBlob(await performanceService.pdf(), "performance-report.pdf"); }
    catch (e) { toast.error(getErrorMessage(e)); }
    finally { setDownloading(false); }
  };

  const p = report.data;
  const outdated = !!p && !!dash.data?.performanceReportOutdated;
  const hasInterviews = (dash.data?.dashboardStats.totalInterviews ?? 0) > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <PageHeader
        title="Performance"
        subtitle="Your progress across every finished interview, with a personal study plan."
        action={p && !generate.isPending && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={download} loading={downloading} icon={<Download className="size-4" />}>PDF</Button>
            <Button onClick={() => generate.mutate()} icon={<RefreshCw className="size-4" />}>Refresh report</Button>
          </div>
        )}
      />

      {outdated && !generate.isPending && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm">
          <TriangleAlert className="size-4 shrink-0 text-warn" aria-hidden />
          <span className="flex-1">Your interviews changed since this report was generated.</span>
          <button onClick={() => generate.mutate()} className="font-medium text-primary hover:underline">Refresh now</button>
        </div>
      )}

      {generate.isPending ? (
        <AiProgress title="Building your performance report" steps={["Collecting all your interview reports", "Comparing skills across interviews", "Finding weak spots", "Writing your study plan"]} hint="usually 15–60 seconds" />
      ) : generate.isError ? (
        <ErrorNotice message={getErrorMessage(generate.error)} onRetry={() => generate.mutate()} />
      ) : report.isError ? (
        <ErrorNotice message={getErrorMessage(report.error)} onRetry={() => report.refetch()} />
      ) : report.isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : !p ? (
        <div className="card border-dashed">
          <EmptyState icon={<LineIcon className="size-5" />} title={hasInterviews ? "Generate your first report" : "Finish an interview first"}
            action={hasInterviews
              ? <Button size="lg" onClick={() => generate.mutate()}>Generate performance report</Button>
              : <Link to="/interviews" className={buttonClass("primary")}>Go to interviews</Link>}>
            {hasInterviews ? "The AI studies all your interviews and builds a plan." : "The report needs at least one completed interview."}
          </EmptyState>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up">
          <div className="grid gap-4 lg:grid-cols-5">
            <section className="card p-5 sm:p-6 lg:col-span-3">
              <h2 className="text-lg font-semibold">Skill balance</h2>
              <SkillRadar data={[
                { skill: "Technical", value: p.technicalProgress },
                { skill: "Communication", value: p.communicationProgress },
                { skill: "Problem solving", value: p.problemSolvingProgress },
                { skill: "Confidence", value: p.confidenceProgress },
              ]} />
            </section>
            <section className="card flex flex-col items-center justify-center gap-5 p-5 sm:p-6 lg:col-span-2">
              <div className="flex items-center gap-5">
                <ScoreRing score={p.overallProgress} size={124} label="Progress" />
                <ScoreRing score={p.interviewReadiness} size={96} label="Readiness" />
              </div>
              <p className="text-center text-xs text-muted">Based on {p.totalInterviews} interview{p.totalInterviews === 1 ? "" : "s"} · updated {formatDate(p.updatedAt)}</p>
            </section>
          </div>

          <section className="card grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <ScoreBar label="Technical" value={p.technicalProgress} />
            <ScoreBar label="Communication" value={p.communicationProgress} />
            <ScoreBar label="Problem solving" value={p.problemSolvingProgress} />
            <ScoreBar label="Confidence" value={p.confidenceProgress} />
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-wide text-success">Strongest</p><p className="mt-1 font-display text-2xl font-bold">{p.strongestSkill}</p></div>
            <div className="card p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-wide text-danger">Weakest</p><p className="mt-1 font-display text-2xl font-bold">{p.weakestSkill}</p></div>
          </div>

          <section className="card p-5 sm:p-6"><h2 className="mb-2 text-lg font-semibold">Summary</h2><p className="leading-relaxed text-muted">{p.summary}</p></section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="card p-5 sm:p-6"><h2 className="mb-3 text-lg font-semibold">Improvement areas</h2><BulletList items={p.improvementAreas} tone="bad" /></section>
            <section className="card p-5 sm:p-6">
              <h2 className="mb-3 text-lg font-semibold">Study plan</h2>
              <ol className="space-y-3">
                {p.studyPlan.map((s, i) => (
                  <li key={s} className="flex gap-3 text-[15px] leading-relaxed">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">{i + 1}</span>{s}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
