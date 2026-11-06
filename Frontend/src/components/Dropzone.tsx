import { FileUp } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { cn } from "../lib/utils";

const MAX = 5 * 1024 * 1024;

/** Drag-and-drop or click-to-choose PDF picker with client-side checks (the server re-checks everything). */
export default function Dropzone({ onFile, busy, error, label = "Drop your resume PDF here" }: { onFile: (file: File) => void; busy?: boolean; error?: string; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [localError, setLocalError] = useState("");

  const pick = (file?: File) => {
    if (!file) return;
    if (!(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) return setLocalError("Only PDF files are allowed.");
    if (file.size > MAX) return setLocalError("That file is larger than 5 MB.");
    setLocalError("");
    onFile(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    pick(e.dataTransfer.files?.[0]);
  };

  const message = localError || error;

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex w-full flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition",
          over ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary/60 hover:bg-sunken/50",
          busy && "opacity-60",
        )}
      >
        <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary"><FileUp className="size-6" aria-hidden /></span>
        <span className="mt-4 text-lg font-semibold">{busy ? "Uploading…" : label}</span>
        <span className="mt-1 text-sm text-muted">or click to browse · PDF only · up to 5 MB · text-based (not a scan)</span>
      </button>
      <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} aria-label="Choose resume PDF" />
      {message && <p role="alert" className="mt-2 text-sm text-danger">{message}</p>}
    </div>
  );
}
