import { memo, useCallback, type ReactElement } from "react";

// ============================================================================
// Types
// ============================================================================

interface EditorTabsProps {
  openFiles: string[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
  onFileClose: (fileName: string) => void;
}

// ============================================================================
// Icons
// ============================================================================

const CloseIcon = memo(() => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
));
CloseIcon.displayName = "CloseIcon";

const getFileIcon = (fileName: string): ReactElement => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  
  const iconMap: Record<string, { color: string }> = {
    py: { color: "text-blue-400" },
    js: { color: "text-yellow-400" },
    ts: { color: "text-blue-500" },
    tsx: { color: "text-blue-500" },
    jsx: { color: "text-yellow-400" },
    cs: { color: "text-purple-400" },
    java: { color: "text-orange-400" },
    go: { color: "text-cyan-400" },
    rs: { color: "text-orange-500" },
    json: { color: "text-yellow-500" },
    html: { color: "text-orange-500" },
    css: { color: "text-blue-400" },
  };

  const config = iconMap[ext] || { color: "text-zinc-400" };

  return (
    <svg className={`w-4 h-4 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface TabProps {
  fileName: string;
  isActive: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
}

const Tab = memo(({ fileName, isActive, onSelect, onClose }: TabProps) => (
  <div
    className={`
      group flex items-center gap-2 px-3 h-full border-r border-[#1a1a1a] cursor-pointer
      ${isActive
        ? "bg-[#151515] text-zinc-200 border-t-2 border-t-[#6cc644]"
        : "bg-[#0d0d0d] text-zinc-500 hover:bg-[#1a1a1a] hover:text-zinc-300"
      }
    `}
    onClick={onSelect}
  >
    {getFileIcon(fileName)}
    <span className="text-sm whitespace-nowrap">{fileName}</span>
    <button
      onClick={onClose}
      className={`
        ml-1 p-0.5 rounded transition-colors
        ${isActive
          ? "hover:bg-zinc-600"
          : "opacity-0 group-hover:opacity-100 hover:bg-zinc-600"
        }
      `}
    >
      <CloseIcon />
    </button>
  </div>
));
Tab.displayName = "Tab";

// ============================================================================
// Main Component
// ============================================================================

export const EditorTabs = memo(({
  openFiles,
  activeFile,
  onFileSelect,
  onFileClose,
}: EditorTabsProps) => {
  const handleClose = useCallback((fileName: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileClose(fileName);
  }, [onFileClose]);

  if (openFiles.length === 0) {
    return (
      <div className="h-9 bg-[#0d0d0d] border-b border-[#1a1a1a]" />
    );
  }

  return (
    <div className="h-9 bg-[#0d0d0d] flex items-stretch border-b border-[#1a1a1a] overflow-x-auto">
      {openFiles.map((fileName) => (
        <Tab
          key={fileName}
          fileName={fileName}
          isActive={fileName === activeFile}
          onSelect={() => onFileSelect(fileName)}
          onClose={handleClose(fileName)}
        />
      ))}
    </div>
  );
});

EditorTabs.displayName = "EditorTabs";
