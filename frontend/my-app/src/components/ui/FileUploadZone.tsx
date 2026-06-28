import { useCallback, useId, useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";

const ACCEPTED_TYPES = [".pdf", ".csv", ".xlsx", ".xls"];
const ACCEPTED_MIME  = [
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
  maxFiles?: number;
}

export function FileUploadZone({
  onFilesSelected,
  isUploading = false,
  maxFiles = 5,
}: FileUploadZoneProps) {
  const inputId        = useId();
  const inputRef       = useRef<HTMLInputElement>(null);
  const [dragging, setDragging]   = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const validate = useCallback(
    (files: FileList | File[]): File[] => {
      const arr = Array.from(files);
      if (arr.length > maxFiles) {
        setError(`Max ${maxFiles} files at once.`);
        return [];
      }
      const invalid = arr.filter((f) => !ACCEPTED_MIME.includes(f.type));
      if (invalid.length > 0) {
        setError(`Unsupported file type: ${invalid.map((f) => f.name).join(", ")}`);
        return [];
      }
      setError(null);
      return arr;
    },
    [maxFiles],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const files = validate(e.dataTransfer.files);
      if (files.length) onFilesSelected(files);
    },
    [validate, onFilesSelected],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = validate(e.target.files);
      if (files.length) onFilesSelected(files);
      e.target.value = ""; // reset so same file can be re-selected
    },
    [validate, onFilesSelected],
  );

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload transaction files — click or drag and drop"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed
          px-8 py-16 text-center transition-all duration-200 cursor-pointer select-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
          ${dragging
            ? "border-indigo-400 bg-indigo-500/5 scale-[1.01]"
            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-3xl">
          {isUploading ? "⏳" : dragging ? "📂" : "📁"}
        </div>

        <div>
          <p className="text-base font-semibold text-slate-200">
            {isUploading ? "Uploading…" : "Drop your bank statements here"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            or <span className="text-indigo-400 underline underline-offset-2">browse files</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {ACCEPTED_TYPES.map((type) => (
            <span
              key={type}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 font-mono text-xs text-slate-400"
            >
              {type}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-600">Up to {maxFiles} files · Auto-categorised by backend</p>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleChange}
          className="sr-only"
          aria-hidden="true"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-500/10 px-4 py-2 text-sm text-rose-400">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}