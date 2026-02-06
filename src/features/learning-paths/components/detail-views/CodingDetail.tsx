import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCodingTaskQuery } from "../../api/learningPathsApi";
import type { CodeItem } from "../../services/type";
import { useCodeSession } from "../../hooks/useCodeSession";
import { IDELayout } from "../ide/IDELayout";

export const CodingDetail = memo(({ item }: { item: CodeItem }) => {
  const { id: learningPathId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch task details
  const {
    data: codingTask,
    // isLoading: isLoadingTask,
  } = useGetCodingTaskQuery(
    { learningPathId: learningPathId!, itemId: item.id },
    { skip: !learningPathId }
  );

  // Initialize Session
  const { 
    state: sessionState, 
    session, 
    isConnected, 
    logs, 
    error, 
    runCode, 
    clearLogs,
    sendTerminalInput,
    resizeTerminal,
    setTerminalOutputHandler,
  } = useCodeSession({
    taskId: item.id,
    autoStart: true,
  });

  // State for files
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [files, setFiles] = useState<Map<string, string>>(new Map());

  // Helper to get filename
  const getFilename = useCallback((lang: string) => {
      const extMap: Record<string, string> = {
          "python": "py",
          "javascript": "js",
          "typescript": "ts",
          "csharp": "cs",
          "go": "go",
          "java": "java"
      };
      const ext = extMap[lang.toLowerCase()] || "txt";
      return `main.${ext}`;
  }, []);

  // Initialize Files when task loads
  useEffect(() => {
    if (codingTask) {
      const filename = getFilename(item.programmingLanguage);
      const initialFiles = new Map<string, string>();
      initialFiles.set(filename, codingTask.initialCodeTemplate || "");
      
      setFiles(initialFiles);
      
      // Only set active if not already set (to preserve state if re-fetching? actually task shouldn't change)
      setActiveFile(filename);
      setOpenFiles([filename]);
    }
  }, [codingTask, item.programmingLanguage, getFilename]);

  // Handlers
  const handleFileChange = useCallback((fileName: string, content: string) => {
    setFiles((prev) => {
        const newFiles = new Map(prev);
        newFiles.set(fileName, content);
        return newFiles;
    });
  }, []);

  const handleRunCode = useCallback(async () => {
    if (sessionState !== "Ready" || !activeFile) return;
    const code = files.get(activeFile) || "";
    if (!code.trim()) return;

    await runCode(code, item.programmingLanguage.toLowerCase());
  }, [sessionState, activeFile, files, item.programmingLanguage, runCode]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleFileSelect = useCallback((fileName: string) => {
    setActiveFile(fileName);
    if (!openFiles.includes(fileName)) {
        setOpenFiles(prev => [...prev, fileName]);
    }
  }, [openFiles]);

  const handleFileClose = useCallback((fileName: string) => {
    setOpenFiles(prev => prev.filter(f => f !== fileName));
    if (activeFile === fileName) {
        setActiveFile(null);
    }
  }, [activeFile]);

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1e1e]">
        <IDELayout
            sessionState={sessionState}
            session={session}
            isConnected={isConnected}
            logs={logs}
            error={error}
            files={files}
            activeFile={activeFile}
            openFiles={openFiles}
            language={item.programmingLanguage}
            onFileSelect={handleFileSelect}
            onFileClose={handleFileClose}
            onFileChange={handleFileChange}
            onRunCode={handleRunCode}
            onClearLogs={clearLogs}
            onGoBack={handleGoBack}
            taskTitle={item.title}
            sendTerminalInput={sendTerminalInput}
            resizeTerminal={resizeTerminal}
            setTerminalOutputHandler={setTerminalOutputHandler}
        />
    </div>
  );
});

CodingDetail.displayName = "CodingDetail";
