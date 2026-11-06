import { ArrowRight, FileSearch, LineChart, MessagesSquare, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import ScorecardDemo from "../components/ScorecardDemo";
import { buttonClass } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const STEPS = [
  { icon: FileSearch, title: "Upload your resume", body: "A PDF is all it takes. The AI extracts your skills, strengths, gaps and an ATS score." },
  { icon: MessagesSquare, title: "Take a tailored interview", body: "Ten questions written from YOUR experience: technical, behavioural, system design and HR." },
  { icon: Target, title: "Get scored on every skill", body: "Technical depth, communication, problem solving and confidence — with feedback you can act on." },
  { icon: LineChart, title: "Watch yourself improve", body: "Trends across interviews, your weakest area and a study plan. Export it as a PDF." },
];

export default function Landing() {
  useDocumentTitle();
  const { user } = useAuth();
  const cta = user ? { to: "/dashboard", label: "Open your dashboard" } : { to: "/register", label: "Start practising free" };

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-medium text-muted">
            <Sparkles className="size-3.5 text-primary" aria-hidden /> AI mock interviews, built from your resume
          </p>
          <h1 className="text-[2.6rem] font-bold leading-[1.04] sm:text-6xl lg:text-[4rem]">
            Rehearse the interview<br /><span className="text-primary">before it counts.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            PrepPilot reads your resume, asks the questions a real interviewer would ask you, scores every answer and shows exactly what to improve next.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={cta.to} className={buttonClass("primary", "lg")}>{cta.label} <ArrowRight className="size-4" /></Link>
            {!user && <Link to="/login" className={buttonClass("secondary", "lg")}>Sign in</Link>}
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted"><ShieldCheck className="size-4" aria-hidden /> Your resume stays private. Delete it, or your whole account, any time.</p>
        </div>
        <ScorecardDemo />
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">From resume to offer-ready in four steps.</h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="bg-bg p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"><Icon className="size-5" aria-hidden /></span>
                  <span className="font-mono text-sm text-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-8 text-primary-ink sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Your next interview is the real one. Make it the second.</h2>
            <p className="mt-2 text-sm opacity-85">Free to try · works with any role · no credit card</p>
          </div>
          <Link to={cta.to} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-surface px-6 font-medium text-ink transition hover:brightness-95">
            {cta.label} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
