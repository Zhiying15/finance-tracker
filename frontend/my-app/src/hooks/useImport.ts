import { importApi } from "@api/index";
import { useAsync } from "./useAsync";

export function useImportFiles() {
  return useAsync(() => importApi.listFiles(), []);
}

export function useImportFile(fileId: number) {
  const file = useAsync(() => importApi.getFile(fileId), [fileId]);
  const rows = useAsync(() => importApi.getRows(fileId), [fileId]);
  return { file, rows };
}