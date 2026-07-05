import { useState } from "react";
import { FileUploadZone } from "@components/ui/FileUploadZone";
import { MOCK_UPLOADS } from "@lib/mock-data";
import type { Api, ImportedFileStatus } from "@api/index";

type ImportedFile      = Api.Import.ImportedFile;

const STATUS_STYLE: Record<ImportedFileStatus, { label: string; cls: string }> = {
  UPLOADED:       { label: "Uploaded",       cls: "bg-indigo-500/10  text-indigo-400"  },
  PROCESSING:     { label: "Processing",     cls: "bg-amber-500/10   text-amber-400"   },
  PENDING_REVIEW: { label: "Pending Review", cls: "bg-yellow-500/10  text-yellow-400"  },
  COMPLETED:      { label: "Completed",      cls: "bg-emerald-500/10 text-emerald-400" },
  FAILED:         { label: "Failed",         cls: "bg-rose-500/10    text-rose-400"    },
};

const FILE_ICON: Record<string, string> = {
  pdf: "📄", csv: "📊", xlsx: "📋", xls: "📋",
};

export function UploadPage() {
  const [queue, setQueue]           = useState<ImportedFile[]>([]);
  const [isUploading, setUploading] = useState(false);
  const [history]                   = useState<ImportedFile[]>(MOCK_UPLOADS);

  async function handleFilesSelected(files: File[]) {
    setUploading(true);

    const newBatches: ImportedFile[] = files.map((f, i) => ({
      id:           Date.now() + i,
      filename:     f.name,
      status:       "UPLOADED" as ImportedFileStatus,
      totalRows:    0,
      approvedRows: 0,
      rejectedRows: 0,
      pendingRows:  0,
      uploadedAt:   new Date().toISOString(),
    }));
    setQueue((q) => [...newBatches, ...q]);

    // TODO: replace simulation with real upload flow:
    // 1. const result = await importApi.upload(file, accountId, (pct) => setProgress(pct))
    // 2. poll importApi.getFile(result.id) every 2s until status === "PENDING_REVIEW"
    // 3. navigate(`/upload/${result.id}/review`) for row-by-row review

    await new Promise((r) => setTimeout(r, 1000));
    setQueue((q) => q.map((b) =>
      newBatches.find((nb) => nb.id === b.id) ? { ...b, status: "PROCESSING" as ImportedFileStatus } : b,
    ));

    await new Promise((r) => setTimeout(r, 1500));
    setQueue((q) => q.map((b) => {
      if (!newBatches.find((nb) => nb.id === b.id)) return b;
      const rows = Math.floor(Math.random() * 15) + 3;
      return { ...b, status: "PENDING_REVIEW" as ImportedFileStatus, totalRows: rows, pendingRows: rows };
    }));

    setUploading(false);
  }

  const allHistory = [...queue, ...history];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Upload zone */}
      <section aria-labelledby="upload-heading">
        <h2 id="upload-heading" className="mb-4 font-semibold text-white">Upload Statements</h2>
        <FileUploadZone onFilesSelected={handleFilesSelected} isUploading={isUploading} maxFiles={5} />
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="rounded-2xl border border-white/5 bg-slate-900/40 p-6">
        <h2 id="how-heading" className="mb-4 font-semibold text-slate-300">How it works</h2>
        <ol className="space-y-3" role="list">
          {[
            "Upload your bank statement — CSV or Excel (.xlsx)",
            "Backend parses and auto-categorises each transaction row",
            "Review each row, fix any errors, then approve or reject",
            "Approved rows become real transactions in your accounts",
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400"
              >
                {i + 1}
              </span>
              {text}
            </li>
          ))}
        </ol>
      </section>

      {/* Upload history */}
      {allHistory.length > 0 && (
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="mb-4 font-semibold text-white">Upload History</h2>
          <ul className="space-y-3" role="list">
            {allHistory.map((batch) => {
              const statusMeta = STATUS_STYLE[batch.status];
              const ext        = batch.filename.split(".").pop()?.toLowerCase() ?? "";
              const icon       = FILE_ICON[ext] ?? "📎";
              const uploaded   = new Intl.DateTimeFormat("en-SG", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              }).format(new Date(batch.uploadedAt));

              return (
                <li key={batch.id} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/60 px-5 py-4">
                  <span aria-hidden="true" className="text-2xl">{icon}</span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{batch.filename}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{uploaded}</p>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-3">
                    {batch.totalRows > 0 && (
                      <span className="text-xs text-slate-500">
                        {batch.pendingRows > 0
                          ? `${batch.pendingRows} pending`
                          : `${batch.approvedRows}/${batch.totalRows} approved`}
                      </span>
                    )}
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.cls}`}>
                      {batch.status === "PROCESSING" && (
                        <span aria-hidden="true" className="mr-1 inline-block animate-spin">⟳</span>
                      )}
                      {statusMeta.label}
                    </span>
                    {batch.status === "PENDING_REVIEW" && (
                      <button
                        type="button"
                        className="rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/20"
                        // TODO: navigate(`/upload/${batch.id}/review`)
                      >
                        Review →
                      </button>
                    )}
                  </div>

                  {batch.errorMessage && (
                    <p role="alert" className="mt-1 text-xs text-rose-400">{batch.errorMessage}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}