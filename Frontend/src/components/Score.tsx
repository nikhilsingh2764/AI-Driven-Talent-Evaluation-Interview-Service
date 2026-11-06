import { useEffect, useState } from "react";
import { cn, scoreTone } from "../lib/utils";

/** Circular gauge. The arc animates from 0 on mount; the number is always readable. */
export function ScoreRing({ score, size = 132, label, className }: { score: number; size?: number; label?: string; className?: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setShown(score));
    return () => window.cancelAnimationFrame(id);
  }, [score]);

  const stroke = Math.max(8, size / 13);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = scoreTone(score);

  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }} role="img" aria-label={`${label ?? "Score"}: ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-sunken" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, Math.max(0, shown))) / 100}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-out", tone.color === "success" ? "stroke-success" : tone.color === "warn" ? "stroke-warn" : "stroke-danger")}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-3xl font-bold tabular-nums leading-none" style={{ fontSize: size * 0.28 }}>{score}</p>
        {label && <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>}
      </div>
    </div>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setW(value));
    return () => window.cancelAnimationFrame(id);
  }, [value]);
  const tone = scoreTone(value);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn("font-display font-semibold tabular-nums", tone.text)}>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", tone.bar)} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const tone = scoreTone(score);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md bg-sunken px-2 py-0.5 text-xs font-semibold tabular-nums", tone.text)}>
      <span className={cn("size-1.5 rounded-full", tone.bar)} aria-hidden /> {score}
    </span>
  );
}
