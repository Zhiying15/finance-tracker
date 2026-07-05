import { client, uploadClient } from "@api/client";
import { ENDPOINTS } from "@api/endpoints";
import type { Api } from "@type/index";

export const importApi = {
  upload: async (
    file: File,
    accountId: number,
    onProgress?: (pct: number) => void,
  ): Promise<Api.Import.ImportedFile> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadClient.post<Api.Import.ImportedFile>(
      ENDPOINTS.IMPORT.UPLOAD,
      formData,
      {
        params: { accountId } satisfies Api.Import.UploadParams,
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      },
    );
    return res.data;
  },

  listFiles: async (): Promise<Api.Import.ImportedFile[]> => {
    const res = await client.get<Api.Import.ImportedFile[]>(ENDPOINTS.IMPORT.FILES);
    return res.data;
  },

  getFile: async (fileId: number): Promise<Api.Import.ImportedFile> => {
    const res = await client.get<Api.Import.ImportedFile>(
      ENDPOINTS.IMPORT.FILE_BY_ID(fileId),
    );
    return res.data;
  },

  getRows: async (fileId: number): Promise<Api.Import.ImportRow[]> => {
    const res = await client.get<Api.Import.ImportRow[]>(ENDPOINTS.IMPORT.ROWS(fileId));
    return res.data;
  },

  updateRow: async (
    fileId: number,
    importTxId: number,
    body: Api.Import.UpdateRowRequest,
  ): Promise<Api.Import.ImportRow> => {
    const res = await client.put<Api.Import.ImportRow>(
      ENDPOINTS.IMPORT.ROW_BY_ID(fileId, importTxId),
      body,
    );
    return res.data;
  },

  approveRow: async (
    fileId: number,
    importTxId: number,
    accountId: number,
  ): Promise<Api.Import.ImportRow> => {
    const res = await client.post<Api.Import.ImportRow>(
      ENDPOINTS.IMPORT.APPROVE_ROW(fileId, importTxId),
      null,
      { params: { accountId } satisfies Api.Import.ApproveRowParams },
    );
    return res.data;
  },

  rejectRow: async (
    fileId: number,
    importTxId: number,
  ): Promise<Api.Import.ImportRow> => {
    const res = await client.post<Api.Import.ImportRow>(
      ENDPOINTS.IMPORT.REJECT_ROW(fileId, importTxId),
    );
    return res.data;
  },

  bulkApprove: async (
    fileId: number,
    accountId: number,
  ): Promise<Api.Import.ImportedFile> => {
    const res = await client.post<Api.Import.ImportedFile>(
      ENDPOINTS.IMPORT.BULK_APPROVE(fileId),
      null,
      { params: { accountId } satisfies Api.Import.BulkApproveParams },
    );
    return res.data;
  },

  bulkReject: async (fileId: number): Promise<Api.Import.ImportedFile> => {
    const res = await client.post<Api.Import.ImportedFile>(
      ENDPOINTS.IMPORT.BULK_REJECT(fileId),
    );
    return res.data;
  },
};