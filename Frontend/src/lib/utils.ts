import { clsx, type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

const dateFmt = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });
const shortFmt = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatShortDate = (iso: string) => shortFmt.format(new Date(iso));

export const timeAgo = (iso: string): string => {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of steps) if (Math.abs(seconds) >= size) return rtf.format(-Math.round(seconds / size), unit);
  return "just now";
};

/** 0-100 score -> label + colour token (shared by rings, bars and badges). */
export const scoreTone = (score: number) =>
  score >= 75 ? { label: "Strong", text: "text-success", bar: "bg-success", color: "success" as const }
  : score >= 50 ? { label: "Fair", text: "text-warn", bar: "bg-warn", color: "warn" as const }
  : { label: "Needs work", text: "text-danger", bar: "bg-danger", color: "danger" as const };

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  }
};

/** Must match the backend's password rules (any non-alphanumeric character counts as special). */
export const PASSWORD_RULES = [
  { id: "len", label: "8–72 characters", test: (v: string) => v.length >= 8 && v.length <= 72 },
  { id: "upper", label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "A lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { id: "digit", label: "A number", test: (v: string) => /[0-9]/.test(v) },
  { id: "symbol", label: "A special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;
export const isStrongPassword = (v: string) => PASSWORD_RULES.every((r) => r.test(v));

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
