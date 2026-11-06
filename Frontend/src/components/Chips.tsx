import { cn } from "../lib/utils";

const tones = {
  neutral: "bg-sunken text-ink",
  good: "bg-success/10 text-success",
  bad: "bg-danger-soft text-danger",
  primary: "bg-primary-soft text-primary",
};

export default function Chips({ items, tone = "neutral" }: { items: string[]; tone?: keyof typeof tones }) {
  if (!items.length) return <p className="text-sm text-muted">Nothing listed.</p>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className={cn("rounded-md px-2.5 py-1 text-[13px] font-medium", tones[tone])}>{item}</li>
      ))}
    </ul>
  );
}

export function BulletList({ items, tone = "neutral" }: { items: string[]; tone?: "neutral" | "good" | "bad" }) {
  if (!items.length) return <p className="text-sm text-muted">Nothing listed.</p>;
  const dot = tone === "good" ? "bg-success" : tone === "bad" ? "bg-danger" : "bg-primary";
  return (
    <ul className="space-y-2.5 text-[15px] leading-relaxed">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className={cn("mt-2.5 size-1.5 shrink-0 rounded-full", dot)} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
