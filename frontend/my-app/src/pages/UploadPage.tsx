import { useState, useRef } from "react";
import { Link } from "react-router";
import type { Api, ImportedFileStatus } from "@api/index";
import { importApi, normaliseError } from "@api/index";
import { FileUploadZone } from "@components/ui/FileUploadZone";
import { PageLoader }     from "@components/ui/PageLoader";
import { useImportFiles } from "@hooks/useImport";
import { useAccounts }    from "@hooks/useAccounts";

type ImportedFile      = Api.Import.ImportedFile;

const STATUS_META: Record<ImportedFileStatus, { label: string; cls: string }> = {
  UPLOADED:       { label: "Uploaded",       cls: "bg-indigo-500/10  text-indigo-400"  },
  PROCESSING:     { label: "Processing",     cls: "bg-amber-500/10   text-amber-400"   },
  PENDING_REVIEW: { label: "Pending Review", cls: "bg-yellow-500/10  text-yellow-400"  },
  COMPLETED:      { label: "Completed",      cls: "bg-emerald-500/10 text-emerald-400" },
  FAILED:         { label: "Failed",         cls: "bg-rose-500/10    text-rose-400"    },
};

const FILE_ICON: Record<string, string> = { pdf: "📄", csv: "📊", xlsx: "📋", xls: "📋" };

export function UploadPage() {
  const filesAsync    = useImportFiles();
  const accountsAsync = useAccounts();

  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isUploading, setUploading]               = useState(false);
  const [uploadError, setUploadError]             = useState<string | null>(null);
  const [uploadProgress, setUploadProgress]       = useState<Record<string, number>>({});
  // Poll refs — track interval IDs per file so we can clear them
  const pollRefs = useRef<Record<number, ReturnType<typeof setInterval>>>({});

  // ── Poll file until it leaves PROCESSING ────────────────────────────────────
  function startPolling(fileId: number) {
    if (pollRefs.current[fileId]) return; // already polling
    pollRefs.current[fileId] = setInterval(async () => {
      try {
        const updated = await importApi.getFile(fileId);
        if (updated.status !== "PROCESSING" && updated.status !== "UPLOADED") {
          clearInterval(pollRefs.current[fileId]);
          delete pollRefs.current[fileId];
          filesAsync.reload();
        }
      } catch {
        clearInterval(pollRefs.current[fileId]);
        delete pollRefs.current[fileId];
      }
    }, 2000);
  }

  async function handleFilesSelected(files: File[]) {
    if (!selectedAccountId) {
      setUploadError("Select an account before uploading");
      return;
    }
    setUploading(true);
    setUploadError(null);

    for (const file of files) {
      try {
        const result = await importApi.upload(
          file,
          Number(selectedAccountId),
          (pct) => setUploadProgress((p) => ({ ...p, [file.name]: pct })),
        );
        // Start polling until PENDING_REVIEW / COMPLETED / FAILED
        if (result.status === "PROCESSING" || result.status === "UPLOADED") {
          startPolling(result.id);
        }
        filesAsync.reload();
      } catch (err) {
        setUploadError(normaliseError(err));
      }
    }

    setUploadProgress({});
    setUploading(false);
  }

  const loader = <PageLoader loading={filesAsync.loading} error={filesAsync.error} onRetry={filesAsync.reload} />;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Upload zone */}
      <section aria-labelledby="upload-heading">
        <h2 id="upload-heading" className="mb-4 font-semibold text-white">Upload Statements</h2>

        {/* Account selector */}
        <div className="mb-4 space-y-1.5">
          <label htmlFor="upload-account" className="block text-sm font-medium text-slate-300">
            Target Account <span className="text-rose-400">*</span>
          </label>
          <select
            id="upload-account"
            value={selectedAccountId}
            onChange={(e) => { setSelectedAccountId(e.target.value); setUploadError(null); }}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select account to book transactions into…</option>
            {(accountsAsync.data ?? []).filter((a) => a.isActive).map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {uploadError && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {uploadError}
          </div>
        )}

        {/* Upload progress */}
        {Object.entries(uploadProgress).map(([name, pct]) => (
          <div key={name} className="mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">{name}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-indigo-500 transition-all duration-200" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}

        <FileUploadZone onFilesSelected={handleFilesSelected} isUploading={isUploading} maxFiles={5} />
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="rounded-2xl border border-white/5 bg-slate-900/40 p-6">
        <h2 id="how-heading" className="mb-4 font-semibold text-slate-300">How it works</h2>
        <ol className="space-y-3" role="list">
          {[
            "Select the account to book transactions into",
            "Upload your bank statement — CSV or Excel (.xlsx)",
            "Backend parses and auto-categorises each row",
            "Review each row, fix any errors, then approve or reject",
            "Approved rows become real transactions in your account",
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
              <span aria-hidden="true" className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                {i + 1}
              </span>
              {text}
            </li>
          ))}
        </ol>
      </section>

      {/* Upload history */}
      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-4 font-semibold text-white">Upload History</h2>
        {loader ?? (
          (filesAsync.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">No uploads yet.</p>
          ) : (
            <ul className="space-y-3" role="list">
              {(filesAsync.data ?? []).map((batch) => (
                <FileHistoryRow key={batch.id} batch={batch} onRefresh={filesAsync.reload} />
              ))}
            </ul>
          )
        )}
      </section>
    </div>
  );
}

// ─── FileHistoryRow ───────────────────────────────────────────────────────────

function FileHistoryRow({ batch, onRefresh }: { batch: ImportedFile; onRefresh: () => void }) {
  const statusMeta = STATUS_META[batch.status];
  const ext        = batch.filename.split(".").pop()?.toLowerCase() ?? "";
  const icon       = FILE_ICON[ext] ?? "📎";
  const uploaded   = new Intl.DateTimeFormat("en-SG", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(batch.uploadedAt));

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/60 px-5 py-4">
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
          <Link
            to={`/upload/${batch.id}/review`}
            className="rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/20"
          >
            Review →
          </Link>
        )}

        {batch.status === "FAILED" && batch.errorMessage && (
          <span className="text-xs text-rose-400">{batch.errorMessage}</span>
        )}
      </div>
    </li>
  );
}