import { memo, useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { Panel, Group, Separator } from "react-resizable-panels";
import type { SessionState } from "../../hooks/useCodeSession";
import { FileExplorer } from "./FileExplorer";
import { EditorTabs } from "./EditorTabs";
import { Terminal } from "./Terminal";
import type { TerminalHandle } from "./Terminal";

// ============================================================================
// Types
// ============================================================================

type SidebarPanel = "explorer" | "search";

interface SessionInfo {
  sessionId: string;
  containerId: string;
}

interface IDELayoutProps {
  sessionState: SessionState;
  session: SessionInfo | null;
  isConnected: boolean;
  logs: string[];
  error: string | null;
  files: Map<string, string>;
  activeFile: string | null;
  openFiles: string[];
  language: string;
  onFileSelect: (fileName: string) => void;
  onFileClose: (fileName: string) => void;
  onFileChange: (fileName: string, content: string) => void;
  onRunCode: () => void;
  onClearLogs: () => void;
  onGoBack: () => void;
  taskTitle: string;
  sendTerminalInput: (data: string) => void;
  resizeTerminal: (cols: number, rows: number) => void;
  setTerminalOutputHandler: (handler: (data: string) => void) => void;
}

// ============================================================================
// Icons
// ============================================================================

const PlayIcon = memo(() => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
));
PlayIcon.displayName = "PlayIcon";

const ArrowLeftIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
));
ArrowLeftIcon.displayName = "ArrowLeftIcon";

const SpinnerIcon = memo(() => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
));
SpinnerIcon.displayName = "SpinnerIcon";

const FolderIcon = memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
));
FolderIcon.displayName = "FolderIcon";

const SearchIcon = memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
));
SearchIcon.displayName = "SearchIcon";

// ============================================================================
// File Search Component
// ============================================================================

interface FileSearchProps {
  files: string[];
  onFileSelect: (fileName: string) => void;
}

const FileSearch = memo(({ files, onFileSelect }: FileSearchProps) => {
  const [query, setQuery] = useState("");

  const filteredFiles = useMemo(() => {
    if (!query.trim()) return files;
    const lowerQuery = query.toLowerCase();
    return files.filter(f => f.toLowerCase().includes(lowerQuery));
  }, [files, query]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search files..."
          autoFocus
          className="w-full px-3 py-1.5 bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] rounded text-sm text-[#cccccc] placeholder-[#858585] outline-none"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="px-4 py-3 text-sm text-[#858585]">
            {query ? "No files found" : "Type to search files"}
          </div>
        ) : (
          filteredFiles.map(file => (
            <button
              key={file}
              onClick={() => onFileSelect(file)}
              className="w-full px-4 py-1.5 text-left text-sm text-[#cccccc] hover:bg-[#2a2d2e] transition-colors truncate"
            >
              {file}
            </button>
          ))
        )}
      </div>
      <div className="px-3 py-2 text-xs text-[#858585] border-t border-[#1e1e1e]">
        <kbd className="px-1 py-0.5 bg-[#3c3c3c] rounded text-[10px]">Ctrl</kbd>
        <span className="mx-1">+</span>
        <kbd className="px-1 py-0.5 bg-[#3c3c3c] rounded text-[10px]">P</kbd>
        <span className="ml-2">Quick open</span>
      </div>
    </div>
  );
});
FileSearch.displayName = "FileSearch";

// ============================================================================
// Sub-components
// ============================================================================

interface StatusBarProps {
  sessionState: SessionState;
  isConnected: boolean;
  language: string;
  activeFile: string | null;
}

const StatusBar = memo(({ sessionState, isConnected, language, activeFile }: StatusBarProps) => {
  const statusConfig: Record<SessionState, { color: string; text: string }> = {
    Idle: { color: "bg-zinc-500", text: "Idle" },
    Provisioning: { color: "bg-amber-500", text: "Booting..." },
    Ready: { color: "bg-green-500", text: "Ready" },
    Running: { color: "bg-blue-500", text: "Running" },
    Terminated: { color: "bg-red-500", text: "Terminated" },
    Error: { color: "bg-red-500", text: "Error" },
  };

  const { color, text } = statusConfig[sessionState];

  return (
    <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-xs text-white select-none">
      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex items-center gap-1.5">
               <span>{text}</span>
            </div>
         </div>
         {isConnected && (
             <span className="flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                 Connected
             </span>
         )}
      </div>
      <div className="flex items-center gap-4">
        {activeFile && (
          <span>{activeFile}</span>
        )}
        <span>{language}</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
});
StatusBar.displayName = "StatusBar";

interface ProvisioningOverlayProps {
  sessionState: SessionState;
}

const ProvisioningOverlay = memo(({ sessionState }: ProvisioningOverlayProps) => {
  if (sessionState !== "Provisioning") return null;

  return (
    <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-xl font-semibold text-zinc-100">Initializing Environment...</p>
        <p className="text-sm text-zinc-400 mt-2">
          Provisioning secure container
        </p>
      </div>
    </div>
  );
});
ProvisioningOverlay.displayName = "ProvisioningOverlay";

// ============================================================================
// Main Component
// ============================================================================

export const IDELayout = memo(({
  sessionState,
  session,
  isConnected,
  logs,
  error,
  files,
  activeFile,
  openFiles,
  language,
  onFileSelect,
  onFileClose,
  onFileChange,
  onRunCode,
  onClearLogs,
  onGoBack,
  taskTitle,
  sendTerminalInput,
  resizeTerminal,
  setTerminalOutputHandler,
}: IDELayoutProps) => {
  // Sidebar panel state
  const [activeSidebarPanel, setActiveSidebarPanel] = useState<SidebarPanel>("explorer");

  // Terminal ref for interactive mode
  const terminalRef = useRef<TerminalHandle>(null);

  // Set up terminal output handler
  useEffect(() => {
    setTerminalOutputHandler((data: string) => {
      terminalRef.current?.write(data);
    });
  }, [setTerminalOutputHandler]);

  // Get Monaco language identifier
  const getMonacoLanguage = useCallback((lang: string): string => {
    const languageMap: Record<string, string> = {
      "C#": "csharp",
      CSharp: "csharp",
      Python: "python",
      JavaScript: "javascript",
      TypeScript: "typescript",
      Java: "java",
      Go: "go",
      Rust: "rust",
      Ruby: "ruby",
      PHP: "php",
    };
    return languageMap[lang] || lang.toLowerCase();
  }, []);

  const monacoLanguage = useMemo(() => getMonacoLanguage(language), [language, getMonacoLanguage]);

  const activeFileContent = useMemo(() => {
    return activeFile ? files.get(activeFile) || "" : "";
  }, [activeFile, files]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (activeFile && value !== undefined) {
      onFileChange(activeFile, value);
    }
  }, [activeFile, onFileChange]);

  const isRunDisabled = sessionState !== "Ready" || !activeFile;
  const isEditorDisabled = sessionState !== "Ready";

  // Convert files Map to array for FileExplorer
  const fileList = useMemo(() => Array.from(files.keys()), [files]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P - Quick file search
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setActiveSidebarPanel("search");
      }
      // Ctrl+E - Explorer
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        setActiveSidebarPanel("explorer");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle file select from search - switch back to explorer
  const handleFileSelectFromSearch = useCallback((fileName: string) => {
    onFileSelect(fileName);
    setActiveSidebarPanel("explorer");
  }, [onFileSelect]);

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden font-sans">
      {/* Provisioning Overlay */}
      <ProvisioningOverlay sessionState={sessionState} />

      {/* Header / Title Bar */}
      <div className="h-10 bg-[#2d2d2d] flex items-center justify-between px-3 border-b border-[#1e1e1e] shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onGoBack}
            className="p-1 hover:bg-[#3d3d3d] rounded text-[#cccccc] transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeftIcon />
          </button>
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[10px] font-bold text-white">
                {language.substring(0, 2).toUpperCase()}
             </div>
             <span className="text-sm font-medium text-white truncate max-w-md">
                {taskTitle}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <span className="text-xs text-[#858585] hidden md:inline-block">
                Auto-saved
            </span>
            <button
                onClick={onRunCode}
                disabled={isRunDisabled}
                className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all
                ${isRunDisabled
                    ? "bg-[#3d3d3d] text-[#858585] cursor-not-allowed"
                    : "bg-[#007acc] hover:bg-[#0062a3] text-white"
                }
                `}
            >
                {sessionState === "Running" ? <SpinnerIcon /> : <PlayIcon />}
                <span>{sessionState === "Running" ? "Running..." : "Run Code"}</span>
            </button>
        </div>
      </div>

      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="vertical" className="w-full h-full" resizeTargetMinimumSize={{ coarse: 40, fine: 20 }}>
            {/* Top Area: Sidebar + Editor */}
            <Panel defaultSize={70} minSize={50} maxSize={85}>
              <Group orientation="horizontal" className="w-full h-full" resizeTargetMinimumSize={{ coarse: 32, fine: 16 }}>
                {/* Sidebar: Activity Bar + Explorer/Search */}
                <Panel defaultSize={18} minSize={12} maxSize={40}>
              <div className="h-full flex flex-row bg-[#252526] border-r border-[#1e1e1e]">
                 {/* Activity Bar */}
                 <div className="w-12 bg-[#333333] flex flex-col items-center py-2 border-r border-[#1e1e1e]">
                    {/* Explorer Button */}
                    <button
                      onClick={() => setActiveSidebarPanel("explorer")}
                      className={`w-12 h-12 flex items-center justify-center transition-colors ${
                        activeSidebarPanel === "explorer"
                          ? "text-white border-l-2 border-white bg-[#252526]"
                          : "text-[#858585] hover:text-white border-l-2 border-transparent"
                      }`}
                      title="Explorer (Ctrl+E)"
                    >
                        <FolderIcon />
                    </button>
                    {/* Search Button */}
                    <button
                      onClick={() => setActiveSidebarPanel("search")}
                      className={`w-12 h-12 flex items-center justify-center transition-colors ${
                        activeSidebarPanel === "search"
                          ? "text-white border-l-2 border-white bg-[#252526]"
                          : "text-[#858585] hover:text-white border-l-2 border-transparent"
                      }`}
                      title="Search (Ctrl+P)"
                    >
                        <SearchIcon />
                    </button>
                 </div>
                 {/* Sidebar Content */}
                 <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 py-2 text-xs font-bold text-[#bbbbbb] uppercase tracking-wider border-b border-[#1e1e1e]">
                        {activeSidebarPanel === "explorer" ? "Explorer" : "Search"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {activeSidebarPanel === "explorer" ? (
                        <FileExplorer
                            files={fileList}
                            activeFile={activeFile}
                            onFileSelect={onFileSelect}
                        />
                      ) : (
                        <FileSearch
                            files={fileList}
                            onFileSelect={handleFileSelectFromSearch}
                        />
                      )}
                    </div>
                 </div>
              </div>
            </Panel>

            <Separator className="
              w-2 bg-[#1e1e1e] hover:bg-[#007acc] cursor-col-resize
              relative
              before:content-[''] before:absolute before:inset-y-0 before:left-1/2 before:-translate-x-1/2
              before:w-[8px] before:bg-transparent
            " />

            {/* Editor Area */}
            <Panel>
              <div className="h-full flex flex-col bg-[#1e1e1e]">
                <EditorTabs
                  openFiles={openFiles}
                  activeFile={activeFile}
                  onFileSelect={onFileSelect}
                  onFileClose={onFileClose}
                />
                <div className="flex-1 overflow-hidden">
                  {activeFile ? (
                    <Editor
                      height="100%"
                      language={monacoLanguage}
                      value={activeFileContent}
                      onChange={handleEditorChange}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: true, renderCharacters: false },
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        fontSize: 14,
                        lineHeight: 22,
                        lineNumbers: "on",
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        readOnly: isEditorDisabled,
                        automaticLayout: true,
                        padding: { top: 10, bottom: 10 },
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                      }}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[#555555]">
                      <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>Select a file to start coding</p>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
              </Group>
            </Panel>

            <Separator className="
              h-2 bg-[#1e1e1e] hover:bg-[#007acc] cursor-row-resize
              relative
              before:content-[''] before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2
              before:h-[8px] before:bg-transparent
            " />

            {/* Terminal - Full Width Bottom Panel */}
            <Panel defaultSize={30} minSize={15} maxSize={70}>
              <Terminal 
                ref={terminalRef}
                logs={logs} 
                onClear={onClearLogs}
                mode="interactive"
                onData={sendTerminalInput}
                onResize={resizeTerminal}
              />
            </Panel>
        </Group>
      </div>

      {/* Footer / Status Bar */}
      <StatusBar
        sessionState={sessionState}
        isConnected={isConnected}
        language={language}
        activeFile={activeFile}
      />
    </div>
  );
});

IDELayout.displayName = "IDELayout";
