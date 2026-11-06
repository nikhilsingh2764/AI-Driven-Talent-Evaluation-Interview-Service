import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

/** Shown while a slow AI request runs. Rotating messages + a timer so the wait never feels frozen. */
export default function AiProgress({ title, steps, hint }: { title: string; steps: string[]; hint?: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const step = Math.min(steps.length - 1, Math.floor(elapsed / 4));

  return (
    <div role="status" aria-live="polite" className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="relative grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Sparkles className="size-6 animate-pulse" aria-hidden />
        <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/10" aria-hidden />
      </div>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{steps[step]}…</p>
      <p className="mt-4 font-mono text-xs text-muted tabular-nums">{elapsed}s{hint ? ` · ${hint}` : ""}</p>
    </div>
  );
}
