import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, MessagesSquare, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AiProgress from "../components/AiProgress";
import PageHeader from "../components/PageHeader";
import { ScoreBadge } from "../components/Score";
import Button, { buttonClass } from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Field from "../components/ui/Field";
import { Badge, EmptyState, ErrorNotice, FormError, Skeleton } from "../components/ui/Misc";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage, getFieldErrors, getStatus } from "../lib/api";
import { DIFFICULTIES, type Difficulty, type InterviewListItem } from "../lib/types";
import { cn, formatDate } from "../lib/utils";
import { interviewService, resumeService } from "../services/interview";

const EXPERIENCE = ["Fresher", "1 year", "2 years", "3–5 years", "5+ years"];

export default function Interviews() {
  useDocumentTitle("Interviews");
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<InterviewListItem | null>(null);

  const list = useQuery({ queryKey: ["interviews"], queryFn: interviewService.list });
  const analysis = useQuery({
    queryKey: ["analysis"],
    queryFn: () => resumeService.analysis().catch((e) => (getStatus(e) === 404 ? null : Promise.reject(e))),
  });

  const remove = useMutation({
    mutationFn: (id: string) => interviewService.remove(id),
    onSuccess: () => {
      toast.success("Interview deleted.");
      setDeleting(null);
      for (const k of ["interviews", "dashboard", "history"]) qc.invalidateQueries({ queryKey: [k] });
    },
    onError: (e) => { setDeleting(null); toast.error(getErrorMessage(e)); },
  });

  const onCreated = (id: string) => {
    qc.invalidateQueries({ queryKey: ["interviews"] });
    navigate(`/practice/${id}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <PageHeader
        title="Mock interviews"
        subtitle="Each interview is ten questions written from your resume, for the role and level you choose."
        action={analysis.data && !open && <Button onClick={() => setOpen(true)} icon={<Plus className="size-4" />}>New interview</Button>}
      />

      {analysis.isSuccess && !analysis.data && (
        <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="font-semibold">Analyse your resume first</h2>
            <p className="text-sm text-muted">Questions are generated from your resume analysis.</p>
          </div>
          <Link to="/resume" className={buttonClass("primary")}>Go to resume <ArrowRight className="size-4" /></Link>
        </div>
      )}

      {open && analysis.data && (
        <CreateForm recommended={analysis.data.recommendedRoles} onCancel={() => setOpen(false)} onCreated={onCreated} />
      )}

      {list.isError ? (
        <ErrorNotice message={getErrorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : list.isPending ? (
        <div className="space-y-3" aria-busy>{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : list.data.length === 0 ? (
        !open && (
          <div className="card border-dashed">
            <EmptyState icon={<MessagesSquare className="size-5" />} title="No interviews yet"
              action={analysis.data ? <Button onClick={() => setOpen(true)} icon={<Plus className="size-4" />}>Create your first interview</Button> : undefined}>
              {analysis.data ? "Pick a role and level — the AI writes ten questions from your resume." : "Upload and analyse your resume to get started."}
            </EmptyState>
          </div>
        )
      ) : (
        <ul className="space-y-3">
          {list.data.map((i) => <InterviewRow key={i.id} item={i} onDelete={() => setDeleting(i)} />)}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete this interview?"
        confirmLabel="Delete interview"
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        description={<>“{deleting?.role}” with its answers and report will be erased. Your performance report is regenerated from what remains.</>}
      />
    </div>
  );
}

function InterviewRow({ item, onDelete }: { item: InterviewListItem; onDelete: () => void }) {
  const done = item.status === "COMPLETED";
  const started = item.status === "STARTED";
  const pct = item.totalQuestions ? Math.round((item.answered / item.totalQuestions) * 100) : 0;

  return (
    <li className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-lg font-semibold">{item.role}</h3>
          <Badge>{item.difficulty}</Badge>
          <Badge>{item.experience}</Badge>
          {done && <Badge tone="good">Completed</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted">Created {formatDate(item.createdAt)} · {item.totalQuestions} questions</p>
        {started && (
          <div className="mt-3 max-w-xs">
            <div className="mb-1 flex justify-between text-xs text-muted"><span>In progress</span><span>{item.answered}/{item.totalQuestions}</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-sunken"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {done && item.overallScore !== null && <ScoreBadge score={item.overallScore} />}
        {done ? (
          item.sessionId
            ? <Link to={`/reports/${item.sessionId}`} className={buttonClass("secondary", "sm")}>View report</Link>
            : null
        ) : (
          <Link to={`/practice/${item.id}`} className={buttonClass("primary", "sm")}>{started ? "Continue" : "Start"} <ArrowRight className="size-4" /></Link>
        )}
        <button onClick={onDelete} aria-label={`Delete ${item.role}`} title="Delete" className={cn("grid size-9 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger")}>
          <Trash2 className="size-[17px]" />
        </button>
      </div>
    </li>
  );
}

function CreateForm({ recommended, onCancel, onCreated }: { recommended: string[]; onCancel: () => void; onCreated: (id: string) => void }) {
  const [role, setRole] = useState(recommended[0] ?? "");
  const [experience, setExperience] = useState("Fresher");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const create = useMutation({
    mutationFn: () => interviewService.create({ role: role.trim(), experience: experience.trim(), difficulty }),
    onSuccess: (iv) => onCreated(iv._id),
    onError: (e) => setFieldErrors(getFieldErrors(e)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (role.trim().length < 2) return setFieldErrors({ role: "Enter the role you are practising for." });
    create.mutate();
  };

  if (create.isPending) {
    return <AiProgress title="Writing your interview" steps={["Reading your resume and analysis", `Choosing ${difficulty.toLowerCase()} questions for ${role.trim()}`, "Balancing technical, behavioural and HR topics", "Polishing the wording"]} hint="usually 10–40 seconds" />;
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-5 sm:p-6" noValidate>
      <h2 className="text-lg font-semibold">New interview</h2>
      {create.isError && !Object.keys(fieldErrors).length && <FormError message={getErrorMessage(create.error)} />}

      <div>
        <Field label="Role you're practising for" value={role} onChange={(e) => setRole(e.target.value)} error={fieldErrors.role} placeholder="e.g. Backend Developer" autoFocus />
        {recommended.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted">Suggested from your resume:</span>
            {recommended.slice(0, 5).map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)} className="rounded-md bg-sunken px-2 py-1 font-medium hover:bg-primary-soft hover:text-primary">{r}</button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="exp" className="mb-1.5 block text-sm font-medium">Experience</label>
          <input id="exp" list="exp-list" value={experience} onChange={(e) => setExperience(e.target.value)} className="field-input" />
          <datalist id="exp-list">{EXPERIENCE.map((x) => <option key={x} value={x} />)}</datalist>
          {fieldErrors.experience && <p className="mt-1.5 text-[13px] text-danger">{fieldErrors.experience}</p>}
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Difficulty</legend>
          <div className="inline-flex w-full rounded-lg border border-line bg-surface p-1">
            {DIFFICULTIES.map((d) => (
              <button key={d} type="button" aria-pressed={difficulty === d} onClick={() => setDifficulty(d)}
                className={cn("flex-1 rounded-md px-3 py-2 text-sm font-medium transition", difficulty === d ? "bg-primary text-primary-ink" : "text-muted hover:text-ink")}>
                {d}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" icon={<MessagesSquare className="size-4" />}>Generate interview</Button>
      </div>
    </form>
  );
}
