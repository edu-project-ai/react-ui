import { useCallback, useState } from "react";

const proxyBase =
  (import.meta.env.VITE_WS_PROXY_URL as string | undefined)
    ?.replace("ws://", "http://")
    .replace("wss://", "https://") ?? "http://localhost:8080";

export function useExportWorkspace(containerId: string | null) {
  const [isExporting, setIsExporting] = useState(false);

  const exportWorkspace = useCallback(async () => {
    if (!containerId || isExporting) return;

    setIsExporting(true);
    try {
      const url = `${proxyBase}/fs/export?id=${encodeURIComponent(containerId)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = "workspace.tar";
      anchor.click();

      // Release the object URL after the click is processed
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
    } finally {
      setIsExporting(false);
    }
  }, [containerId, isExporting]);

  return { exportWorkspace, isExporting };
}
