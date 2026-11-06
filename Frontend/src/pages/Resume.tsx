import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileText, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import AiProgress from "../components/AiProgress";
import Chips, { BulletList } from "../components/Chips";
import Dropzone from "../components/Dropzone";
import PageHeader from "../components/PageHeader";
import { ScoreRing } from "../components/Score";
import Button, { buttonClass } from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { ErrorNotice, Skeleton } from "../components/ui/Misc";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { API_URL, getErrorMessage, getStatus } from "../lib/api";
import type { Resume, ResumeAnalysis } from "../lib/types";
import { formatDate } from "../lib/utils";
import { resumeService } from "../services/interview";

const orNull = <T,>(p: Promise<T>) => p.catch((e) => (getStatus(e) === 404 ? null : Promise.reject(e)));

export default function ResumePage() {
  useDocumentTitle("Resume");
  const qc = useQueryClient();
  const toast = useToast();
  const replaceInput = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const resume = useQuery({ queryKey: ["resume"], queryFn: () => orNull(resumeService.get()) });
  const analysis = useQuery({ queryKey: ["analysis"], queryFn: () => orNull(resumeService.analysis()), enabled: !!resume.data });

  const refreshAll = () => {
    for (const key of ["resume", "analysis", "dashboard", "interviews"]) qc.invalidateQueries({ queryKey: [key] });
  };

  const upload = useMutation({
    mutationFn: resumeService.upload,
    onSuccess: () => { toast.success("Resume uploaded. Now analyse it."); refreshAll(); },
  });
  const replace = useMutation({
    mutationFn: resumeService.replace,
    onSuccess: () => { toast.success("Resume replaced. Run the analysis again."); refreshAll(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const analyze = useMutation({
    mutationFn: resumeService.analyze,
    onSuccess: (data) => { qc.setQueryData(["analysis"], data); toast.success("Analysis ready."); refreshAll(); },
  });
  const remove = useMutation({
    mutationFn: resumeService.remove,
    onSuccess: () => { toast.success("Resume deleted."); setConfirmDelete(false); qc.setQueryData(["analysis"], null); refreshAll(); },
    onError: (e) => { setConfirmDelete(false); toast.error(getErrorMessage(e)); },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <PageHeader title="Resume" subtitle="Upload your resume once. The AI reads it to analyse your profile and to write interview questions that fit you." />

      {resume.isError ? (
        <ErrorNotice message={getErrorMessage(resume.error)} onRetry={() => resume.refetch()} />
      ) : resume.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : !resume.data ? (
        <Dropzone onFile={(f) => upload.mutate(f)} busy={upload.isPending} error={upload.isError ? getErrorMessage(upload.error) : undefined} />
      ) : (
        <>
          <ResumeCard
            resume={resume.data}
            replacing={replace.isPending}
            onReplace={() => replaceInput.current?.click()}
            onDelete={() => setConfirmDelete(true)}
          />
          <input ref={replaceInput} type="file" accept="application/pdf,.pdf" hidden aria-label="Choose replacement PDF"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) replace.mutate(f); e.target.value = ""; }} />

          <section aria-labelledby="analysis-h" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="analysis-h" className="text-xl font-semibold">AI analysis</h2>
              {analysis.data && !analyze.isPending && (
                <Button variant="secondary" size="sm" onClick={() => analyze.mutate()} icon={<RefreshCw className="size-4" />}>Run again</Button>
              )}
            </div>

            {analyze.isPending ? (
              <AiProgress title="Analysing your resume" steps={["Reading your resume", "Extracting skills and experience", "Scoring ATS readiness", "Writing suggestions"]} hint="usually 10–40 seconds" />
            ) : analyze.isError ? (
              <ErrorNotice message={getErrorMessage(analyze.error)} onRetry={() => analyze.mutate()} />
            ) : analysis.isPending ? (
              <Skeleton className="h-60 w-full" />
            ) : analysis.data ? (
              <AnalysisView a={analysis.data} />
            ) : (
              <div className="card flex flex-col items-center px-6 py-12 text-center">
                <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary"><Sparkles className="size-6" aria-hidden /></span>
                <h3 className="mt-4 text-lg font-semibold">Ready to analyse</h3>
                <p className="mt-1 max-w-md text-sm text-muted">You'll get a summary, skills, strengths, gaps, recommended roles and an ATS score.</p>
                <Button className="mt-5" size="lg" onClick={() => analyze.mutate()} icon={<Sparkles className="size-4" />}>Analyse my resume</Button>
              </div>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your resume?"
        confirmLabel="Delete resume"
        loading={remove.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        description="The file and its analysis are removed. Your existing interviews and reports are kept."
      />
    </div>
  );
}

function ResumeCard({ resume, replacing, onReplace, onDelete }: { resume: Resume; replacing: boolean; onReplace: () => void; onDelete: () => void }) {
  return (
    <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><FileText className="size-6" aria-hidden /></span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{resume.fileName}</p>
          <p className="text-sm text-muted">Uploaded {formatDate(resume.createdAt)} · {resume.textLength.toLocaleString()} characters read</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={`${API_URL}/resume/file`} target="_blank" rel="noreferrer" className={buttonClass("secondary", "sm")}><ExternalLink className="size-4" /> View PDF</a>
        <Button variant="secondary" size="sm" onClick={onReplace} loading={replacing} icon={<RefreshCw className="size-4" />}>Replace</Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="hover:text-danger" icon={<Trash2 className="size-4" />}>Delete</Button>
      </div>
    </div>
  );
}

function AnalysisView({ a }: { a: ResumeAnalysis }) {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="card flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
        <ScoreRing score={a.atsScore} label="ATS score" />
        <div>
          <h3 className="text-lg font-semibold">Summary</h3>
          <p className="mt-1.5 leading-relaxed text-muted">{a.summary}</p>
          <p className="mt-3 text-sm">Ready for practice? <Link to="/interviews" className="font-medium text-primary hover:underline">Create a mock interview</Link></p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Block title="Technical skills"><Chips items={a.technicalSkills} tone="primary" /></Block>
        <Block title="Soft skills"><Chips items={a.softSkills} /></Block>
        <Block title="Strengths"><BulletList items={a.strengths} tone="good" /></Block>
        <Block title="Weaknesses"><BulletList items={a.weaknesses} tone="bad" /></Block>
        <Block title="Missing skills"><Chips items={a.missingSkills} tone="bad" /></Block>
        <Block title="Recommended roles"><Chips items={a.recommendedRoles} tone="good" /></Block>
      </div>
      <Block title="How to improve your resume"><BulletList items={a.improvementSuggestions} /></Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      {children}
    </section>
  );
}
