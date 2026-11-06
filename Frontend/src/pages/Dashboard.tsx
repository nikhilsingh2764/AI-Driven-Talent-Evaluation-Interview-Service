import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, FileText, LineChart as LineIcon, MessagesSquare, Sparkles, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { ScoreTrend, SkillRadar } from "../components/charts";
import PageHeader from "../components/PageHeader";
import { ScoreBadge, ScoreRing } from "../components/Score";
import { buttonClass } from "../components/ui/Button";
import { ErrorNotice, Skeleton } from "../components/ui/Misc";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage, getStatus } from "../lib/api";
import { cn, formatDate } from "../lib/utils";
import { performanceService, resumeService } from "../services/interview";

export default function Dashboard() {
  useDocumentTitle("Dashboard");
  const { user } = useAuth();
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: performanceService.dashboard });
  const resume = useQuery({
    queryKey: ["resume"],
    queryFn: () => resumeService.get().catch((e) => (getStatus(e) === 404 ? null : Promise.reject(e))),
  });

  const d = dash.data;
  const steps = [
    { done: !!resume.data, title: "Upload your resume", body: "A text-based PDF, up to 5 MB.", to: "/resume", icon: FileText },
    { done: !!d?.resumeAnalysis, title: "Analyse it with AI", body: "Skills, strengths, gaps and an ATS score.", to: "/resume", icon: Sparkles },
    { done: (d?.dashboardStats.totalInterviews ?? 0) > 0, title: "Finish a mock interview", body: "Ten questions built from your resume.", to: "/interviews", icon: MessagesSquare },
    { done: !!d?.progressChart, title: "Generate your performance report", body: "Trends, weak spots and a study plan.", to: "/performance", icon: LineIcon },
  ];
  const next = steps.find((s) => !s.done);
  const ready = dash.isSuccess && !resume.isPending;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <PageHeader title={`Hi, ${user?.username ?? "there"}`} subtitle="Your interview readiness at a glance." />

      {dash.isError ? (
        <ErrorNotice message={getErrorMessage(dash.error)} onRetry={() => dash.refetch()} />
      ) : !ready || !d ? (
        <div className="space-y-4" aria-busy>
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28" />)}</div>
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <>
          {d.performanceReportOutdated && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm">
              <TriangleAlert className="size-4 shrink-0 text-warn" aria-hidden />
              <span className="flex-1">Your interviews changed since the last performance report.</span>
              <Link to="/performance" className="font-medium text-primary hover:underline">Refresh it</Link>
            </div>
          )}

          {next ? (
            <section aria-label="Getting started" className="card overflow-hidden">
              <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Next step</p>
                  <h2 className="mt-1 text-xl font-semibold">{next.title}</h2>
                  <p className="mt-1 text-sm text-muted">{next.body}</p>
                  <Link to={next.to} className={buttonClass("primary", "md", "mt-4")}>Continue <ArrowRight className="size-4" /></Link>
                </div>
                <ol className="grid gap-2 sm:grid-cols-2 lg:w-[26rem]">
                  {steps.map((s, i) => (
                    <li key={s.title} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm", s.done ? "bg-success/10 text-success" : s === next ? "bg-primary-soft text-primary" : "bg-sunken text-muted")}>
                      <span className={cn("grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold", s.done ? "bg-success text-primary-ink" : "bg-surface")}>
                        {s.done ? <Check className="size-3" aria-hidden /> : i + 1}
                      </span>
                      <span className="font-medium">{s.title}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          ) : (
            <section className="card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-semibold">You're all set up 🎯</h2>
                <p className="text-sm text-muted">Keep practising — every session sharpens your answers.</p>
              </div>
              <Link to="/interviews" className={buttonClass("primary")}>Start another interview <ArrowRight className="size-4" /></Link>
            </section>
          )}

          <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Interviews completed", d.dashboardStats.totalInterviews, ""],
              ["Average score", d.dashboardStats.averageScore, "/100"],
              ["Interview readiness", d.dashboardStats.interviewReadiness, "%"],
              ["Overall progress", d.dashboardStats.overallProgress, "%"],
            ].map(([label, value, unit]) => (
              <div key={label as string} className="bg-surface p-5">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="mt-1 font-display text-4xl font-bold tabular-nums">{value}<span className="ml-0.5 text-base font-medium text-muted">{unit}</span></dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-4 lg:grid-cols-5">
            <section className="card p-5 sm:p-6 lg:col-span-3" aria-labelledby="trend-h">
              <h2 id="trend-h" className="mb-4 text-lg font-semibold">Scores over time</h2>
              {d.interviewHistory.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">Finish your first interview to see your trend.</p>
              ) : (
                <>
                  <ScoreTrend data={d.interviewHistory.map((h) => ({ date: h.createdAt, score: h.overallScore, readiness: h.interviewReadiness }))} />
                  {d.interviewHistory.length === 1 && <p className="mt-2 text-center text-xs text-muted">Finish one more interview to see a trend line.</p>}
                </>
              )}
            </section>
            <section className="card p-5 sm:p-6 lg:col-span-2" aria-labelledby="skills-h">
              <h2 id="skills-h" className="mb-2 text-lg font-semibold">Skill balance</h2>
              {d.progressChart ? (
                <SkillRadar
                  data={[
                    { skill: "Technical", value: d.progressChart.technicalProgress },
                    { skill: "Communication", value: d.progressChart.communicationProgress },
                    { skill: "Problem solving", value: d.progressChart.problemSolvingProgress },
                    { skill: "Confidence", value: d.progressChart.confidenceProgress },
                  ]}
                />
              ) : (
                <p className="py-16 text-center text-sm text-muted">Generate a <Link to="/performance" className="font-medium text-primary hover:underline">performance report</Link> to see your skill balance.</p>
              )}
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <section className="card p-5 sm:p-6 lg:col-span-3" aria-labelledby="recent-h">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="recent-h" className="text-lg font-semibold">Recent interviews</h2>
                <Link to="/history" className="text-sm font-medium text-primary hover:underline">View all</Link>
              </div>
              {d.interviewHistory.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">Nothing yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {[...d.interviewHistory].reverse().slice(0, 5).map((h) => (
                    <li key={h.sessionId}>
                      <Link to={`/reports/${h.sessionId}`} className="flex items-center justify-between gap-3 py-3 hover:text-primary">
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{h.role ?? "Interview"}</span>
                          <span className="text-xs text-muted">{h.difficulty} · {formatDate(h.createdAt)}</span>
                        </span>
                        <ScoreBadge score={h.overallScore} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card p-5 sm:p-6 lg:col-span-2" aria-labelledby="ats-h">
              <h2 id="ats-h" className="mb-4 text-lg font-semibold">Resume</h2>
              {d.resumeAnalysis ? (
                <div className="flex items-center gap-5">
                  <ScoreRing score={d.resumeAnalysis.atsScore} size={96} label="ATS" />
                  <div className="min-w-0 text-sm">
                    <p className="line-clamp-3 text-muted">{d.resumeAnalysis.summary}</p>
                    <Link to="/resume" className="mt-2 inline-block font-medium text-primary hover:underline">Full analysis</Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">No analysis yet. <Link to="/resume" className="font-medium text-primary hover:underline">Upload and analyse your resume</Link> to unlock tailored interviews.</p>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
