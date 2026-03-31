import { useCallback, useState } from "react";
import { getAccessToken } from "../../../lib/token-provider";

const proxyBase =
  (import.meta.env.VITE_WS_PROXY_URL as string | undefined)
    ?.replace("ws://", "http://")
    .replace("wss://", "https://") ?? "http://localhost:8080";

export function useImportWorkspace(containerId: string | null) {
  const [isImporting, setIsImporting] = useState(false);

  const importWorkspace = useCallback(
    async (file: File): Promise<void> => {
      if (!containerId || isImporting) return;

      setIsImporting(true);
      try {
        const form = new FormData();
        form.append("file", file);

        const url = `${proxyBase}/fs/import?id=${encodeURIComponent(containerId)}`;
        const token = await getAccessToken();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(url, { method: "POST", body: form, headers });

        if (!response.ok) {
          throw new Error(`Import failed: ${response.statusText}`);
        }
      } finally {
        setIsImporting(false);
      }
    },
    [containerId, isImporting],
  );

  return { importWorkspace, isImporting };
}
