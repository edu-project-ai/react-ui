import { memo, useState, useEffect, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import type { CodeItem, CodingTaskDetail } from "../../services/type";
import { useCodeSession } from "../../hooks/useCodeSession";
import { useGetCodingTaskQuery } from "../../api/learningPathsApi";
import { IDELayout } from "../ide/IDELayout";
import { Spinner } from "@/components/ui/spinner";

// ============================================================================
// Types
// ============================================================================

interface LocationState {
  item?: CodeItem;
  codingTask?: CodingTaskDetail;
}

// ============================================================================
// Main Component
// ============================================================================

export const CodingTaskIDEPage = memo(() => {
  const navigate = useNavigate();
  const { id: learningPathId, taskId } = useParams<{ id: string; taskId: string }>();
  const location = useLocation();
  const locationState = location.state as LocationState | undefined;

  const [files, setFiles] = useState<Map<string, string>>(new Map());
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  
  // Get item from location state
  const item = locationState?.item;
  const codingTaskFromState = locationState?.codingTask;

  // Fallback: fetch codingTask if not in state (e.g., page refresh)
  const { data: fetchedCodingTask } = useGetCodingTaskQuery(
    { learningPathId: learningPathId!, itemId: taskId! },
    { skip: !!codingTaskFromState || !learningPathId || !taskId }
  );

  // Use state first, fallback to fetched data
  const codingTask = codingTaskFromState || fetchedCodingTask;

  // Session lifecycle - provisions container on mount
  // IMPORTANT: Use codingTask.id (the actual CodingTask ID from DB), 
  // not taskId from URL which is actually the LearningItem ID
  const {
    state: sessionState,
    session,
    isConnected,
    logs,
    error: sessionError,
    runCode,
    clearLogs,
    sendTerminalInput,
    resizeTerminal,
    setTerminalOutputHandler,
  } = useCodeSession({
    taskId: codingTask?.id || "",
    autoStart: !!codingTask?.id,
  });

  // Initialize files from codingTask template
  useEffect(() => {
    if (codingTask?.initialCodeTemplate) {
      // Parse initial code template - could be JSON array of files or single string
      try {
        const parsed = JSON.parse(codingTask.initialCodeTemplate);
        if (Array.isArray(parsed)) {
          const fileMap = new Map<string, string>();
          parsed.forEach((file: { name: string; content: string }) => {
            fileMap.set(file.name, file.content);
          });
          setFiles(fileMap);
          
          // Set first file as active
          if (parsed.length > 0) {
            setActiveFile(parsed[0].name);
            setOpenFiles([parsed[0].name]);
          }
        } else {
          // Single file - use language extension
          const ext = getFileExtension(item?.programmingLanguage || "python");
          const fileName = `main${ext}`;
          setFiles(new Map([[fileName, codingTask.initialCodeTemplate]]));
          setActiveFile(fileName);
          setOpenFiles([fileName]);
        }
      } catch {
        // Plain text code template
        const ext = getFileExtension(item?.programmingLanguage || "python");
        const fileName = `main${ext}`;
        setFiles(new Map([[fileName, codingTask.initialCodeTemplate]]));
        setActiveFile(fileName);
        setOpenFiles([fileName]);
      }
    }
  }, [codingTask, item]);

  // Get file extension from language
  const getFileExtension = useCallback((language: string): string => {
    const extMap: Record<string, string> = {
      python: ".py",
      javascript: ".js",
      typescript: ".ts",
      "c#": ".cs",
      csharp: ".cs",
      java: ".java",
      go: ".go",
      rust: ".rs",
      ruby: ".rb",
      php: ".php",
    };
    return extMap[language.toLowerCase()] || ".txt";
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((fileName: string) => {
    setActiveFile(fileName);
    if (!openFiles.includes(fileName)) {
      setOpenFiles(prev => [...prev, fileName]);
    }
  }, [openFiles]);

  // Handle file close
  const handleFileClose = useCallback((fileName: string) => {
    setOpenFiles(prev => {
      const newOpenFiles = prev.filter(f => f !== fileName);
      // If closing active file, switch to another open file
      if (activeFile === fileName && newOpenFiles.length > 0) {
        setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
      } else if (newOpenFiles.length === 0) {
        setActiveFile(null);
      }
      return newOpenFiles;
    });
  }, [activeFile]);

  // Handle file content change
  const handleFileChange = useCallback((fileName: string, content: string) => {
    setFiles(prev => {
      const newFiles = new Map(prev);
      newFiles.set(fileName, content);
      return newFiles;
    });
  }, []);

  // Handle run code
  const handleRunCode = useCallback(async () => {
    if (sessionState !== "Ready" || !activeFile) return;
    
    const code = files.get(activeFile) || "";
    const language = item?.programmingLanguage?.toLowerCase() || "python";
    
    await runCode(code, language);
  }, [sessionState, activeFile, files, item, runCode]);

  // Handle go back
  const handleGoBack = useCallback(() => {
    navigate(`/learning-paths/${learningPathId}/tasks/${taskId}`, {
      state: { item, codingTask },
    });
  }, [navigate, learningPathId, taskId, item, codingTask]);

  // If no item in state, redirect back to intro
  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-zinc-400">Переадресація...</p>
        </div>
      </div>
    );
  }

  return (
    <IDELayout
      sessionState={sessionState}
      session={session}
      isConnected={isConnected}
      logs={logs}
      error={sessionError}
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
  );
});

CodingTaskIDEPage.displayName = "CodingTaskIDEPage";
