import { useState } from "react";
import { FileUploadZone } from "@components/ui/FileUploadZone";
import { MOCK_UPLOADS } from "@lib/mock-data";
import type { UploadBatch, UploadStatus } from "@type/index";

const STATUS_STYLE: Record<UploadStatus, { label: string; cls: string }> = {
  idle:       { label: "Idle",       cls: "bg-slate-500/10 text-slate-400"  },
  uploading:  { label: "Uploading",  cls: "bg-indigo-500/10 text-indigo-400"},
  processing: { label: "Processing", cls: "bg-amber-500/10  text-amber-400" },
  success:    { label: "Success",    cls: "bg-emerald-500/10 text-emerald-400"},
  error:      { label: "Error",      cls: "bg-rose-500/10   text-rose-400"  },
};

const FILE_ICON: Record<string, string> = {
  pdf:  "📄",
  csv:  "📊",
  xlsx: "📋",
  xls:  "📋",
};

export function UploadPage() {
  const [queue, setQueue]         = useState<UploadBatch[]>([]);
  const [isUploading, setUploading] = useState(false);
  const [history]                 = useState<UploadBatch[]>(MOCK_UPLOADS);

  async function handleFilesSelected(files: File[]) {
    setUploading(true);

    // Optimistically add to queue with "uploading" status
    const newBatches: UploadBatch[] = files.map((f) => ({
      id:         `up_${Date.now()}_${f.name}`,
      filename:   f.name,
      fileType:   f.name.split(".").pop()?.toLowerCase() ?? "unknown",
      uploadedAt: new Date().toISOString(),
      status:     "uploading",
    }));
    setQueue((q) => [...newBatches, ...q]);

    // TODO: replace with real API calls
    // const formData = new FormData();
    // files.forEach((f) => formData.append("files", f));
    // await uploadApi.post("/transactions/upload", formData, {
    //   onUploadProgress: (e) => { ... }
    // });

    // Simulate upload → processing → success
    await new Promise((r) => setTimeout(r, 1000));
    setQueue((q) =>
      q.map((b) =>
        newBatches.find((nb) => nb.id === b.id)
          ? { ...b, status: "processing" }
          : b,
      ),
    );

    await new Promise((r) => setTimeout(r, 1500));
    setQueue((q) =>
      q.map((b) =>
        newBatches.find((nb) => nb.id === b.id)
          ? { ...b, status: "success", transactionCount: Math.floor(Math.random() * 15) + 3 }
          : b,
      ),
    );

    setUploading(false);
  }

  const allHistory = [...queue, ...history];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Upload zone */}
      <section aria-labelledby="upload-heading">
        <h2 id="upload-heading" className="mb-4 font-semibold text-white">
          Upload Statements
        </h2>
        <FileUploadZone
          onFilesSelected={handleFilesSelected}
          isUploading={isUploading}
          maxFiles={5}
        />
      </section>

      {/* How it works */}
      <section
        aria-labelledby="how-it-works-heading"
        className="rounded-2xl border border-white/5 bg-slate-900/40 p-6"
      >
        <h2 id="how-it-works-heading" className="mb-4 font-semibold text-slate-300">
          How it works
        </h2>
        <ol className="space-y-3" role="list">
          {[
            { step: "1", text: "Upload your bank statement — PDF, CSV, or Excel" },
            { step: "2", text: "The backend parses and auto-categorises each transaction" },
            { step: "3", text: "Transactions appear in your dashboard and budget immediately" },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-3 text-sm text-slate-400">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400"
              >
                {item.step}
              </span>
              {item.text}
            </li>
          ))}
        </ol>
      </section>

      {/* Upload history */}
      {allHistory.length > 0 && (
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="mb-4 font-semibold text-white">
            Upload History
          </h2>
          <ul className="space-y-3" role="list">
            {allHistory.map((batch) => {
              const statusMeta = STATUS_STYLE[batch.status];
              const icon = FILE_ICON[batch.fileType] ?? "📎";
              const uploadedDate = new Intl.DateTimeFormat("en-SG", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              }).format(new Date(batch.uploadedAt));

              return (
                <li
                  key={batch.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/60 px-5 py-4"
                >
                  <span aria-hidden="true" className="text-2xl">{icon}</span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{batch.filename}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{uploadedDate}</p>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-3">
                    {batch.transactionCount != null && (
                      <span className="text-xs text-slate-500">
                        {batch.transactionCount} transactions
                      </span>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.cls}`}
                    >
                      {batch.status === "processing" && (
                        <span aria-hidden="true" className="mr-1 inline-block animate-spin">⟳</span>
                      )}
                      {statusMeta.label}
                    </span>
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
