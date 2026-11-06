import { Link } from "react-router-dom";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path d="M9 22V10h7a4 4 0 0 1 0 8H9" className="stroke-primary-ink" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="23" cy="22" r="2.3" className="fill-primary-ink" />
    </svg>
  );
}

export default function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 rounded-lg" aria-label="PrepPilot home">
      <LogoMark />
      <span className="font-display text-[21px] font-bold tracking-tight">PrepPilot</span>
    </Link>
  );
}
