import { useEffect, useState } from "react";
import { ScoreRing } from "./Score";

const SAMPLES = [
  { q: "Your resume mentions caching with Redis. How would you keep the cache consistent after a database update?", a: "I'd invalidate on write: delete the key right after the DB commit, with a short TTL as a safety net…", score: 84, bars: [88, 79, 85] },
  { q: "Tell me about a time you disagreed with a teammate on a technical decision.", a: "On my last project we split on REST versus GraphQL. I wrote a one-page comparison with benchmarks…", score: 72, bars: [70, 81, 66] },
  { q: "Design a URL shortener that handles ten million redirects a day.", a: "Hash-based codes, a read-heavy cache in front of the database, and async click logging so redirects stay fast…", score: 91, bars: [93, 86, 92] },
] as const;

const LABELS = ["Technical", "Communication", "Problem solving"];

/** Landing-page centrepiece: a question, a typed answer, then the score card filling in. */
export default function ScorecardDemo() {
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [i, setI] = useState(0);
  const [chars, setChars] = useState(reduce ? 999 : 0);
  const [scored, setScored] = useState(reduce);
  const s = SAMPLES[i];

  useEffect(() => {
    if (reduce) return;
    if (!scored) {
      if (chars < s.a.length) {
        const id = window.setTimeout(() => setChars((c) => c + 2), 22);
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => setScored(true), 500);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => { setI((n) => (n + 1) % SAMPLES.length); setChars(0); setScored(false); }, 4200);
    return () => window.clearTimeout(id);
  }, [chars, scored, s.a.length, reduce]);

  return (
    <div className="card p-5 shadow-[0_28px_70px_-30px_rgb(var(--c-ink)/0.4)] sm:p-6" aria-hidden>
      <div className="flex items-center justify-between text-xs font-medium text-muted">
        <span className="rounded-md bg-primary-soft px-2 py-0.5 text-primary">Question {i + 4} of 10</span>
        <span>Medium · Backend Developer</span>
      </div>
      <p className="mt-4 font-display text-[17px] font-semibold leading-snug">{s.q}</p>

      <div className="mt-4 min-h-[5.5rem] rounded-lg bg-sunken px-3.5 py-3 text-sm leading-relaxed text-muted">
        <span className={scored ? "" : "caret"}>{s.a.slice(0, chars)}</span>
      </div>

      <div className={`mt-5 flex items-center gap-5 transition-all duration-500 ${scored ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
        <ScoreRing key={`${i}-${scored}`} score={scored ? s.score : 0} size={88} label="Score" />
        <div className="flex-1 space-y-2.5">
          {LABELS.map((l, k) => (
            <div key={l}>
              <div className="flex justify-between text-xs"><span className="text-muted">{l}</span><span className="font-semibold tabular-nums">{s.bars[k]}</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sunken"><div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: scored ? `${s.bars[k]}%` : "0%", transitionDelay: `${k * 120}ms` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
