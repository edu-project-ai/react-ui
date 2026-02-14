import { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { useGetCodingTaskQuery } from '@/features/learning-paths/api/learningPathsApi';
import { FileTree } from '../components/FileTree';
import { Terminal } from '../components/terminal/Terminal';
import { readFile, writeFile } from '../api/fsApi';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const EXT_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.json': 'json',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.sql': 'sql',
  '.graphql': 'graphql',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'cpp',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.sh': 'shell',
  '.bash': 'shell',
  '.dockerfile': 'dockerfile',
  '.toml': 'ini',
};

function getLanguageFromPath(path: string): string {
  const dot = path.lastIndexOf('.');
  if (dot < 0) return 'plaintext';
  const ext = path.slice(dot).toLowerCase();
  return EXT_TO_LANGUAGE[ext] ?? 'plaintext';
}

// ─────────────────────────────────────────────
// IdePage — standalone full-screen IDE
// ─────────────────────────────────────────────

export function IdePage() {
  const { learningPathId, itemId } = useParams<{
    learningPathId: string;
    itemId: string;
  }>();
  const navigate = useNavigate();

  // ── Data fetching ──
  const {
    data: codingTask,
    isLoading: isLoadingTask,
    error: taskError,
  } = useGetCodingTaskQuery(
    { learningPathId: learningPathId!, itemId: itemId! },
    { skip: !learningPathId || !itemId },
  );

  // ── Container / session state ──
  const [containerId, setContainerId] = useState<string | null>(null);

  // ── Editor state ──
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editorContentRef = useRef('');
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);

  // ── File selection ──
  const handleSelectFile = useCallback(
    async (path: string) => {
      if (!containerId) return;

      setSelectedFile(path);
      setIsLoadingFile(true);
      try {
        const content = await readFile(containerId, path);
        setFileContent(content);
        editorContentRef.current = content;
      } catch (err) {
        toast.error(
          `Failed to load file: ${err instanceof Error ? err.message : 'unknown error'}`,
        );
      } finally {
        setIsLoadingFile(false);
      }
    },
    [containerId],
  );

  // ── Save handler ──
  const handleSave = useCallback(async () => {
    if (!containerId || !selectedFile) return;

    setIsSaving(true);
    try {
      await writeFile(containerId, selectedFile, editorContentRef.current);
      toast.success('File saved');
    } catch (err) {
      toast.error(
        `Save failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
    } finally {
      setIsSaving(false);
    }
  }, [containerId, selectedFile]);

  // ── Monaco mount — register Ctrl+S ──
  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        () => {
          handleSave();
        },
      );
    },
    [handleSave],
  );

  // ── Monaco content change ──
  const handleEditorChange = useCallback((value: string | undefined) => {
    editorContentRef.current = value ?? '';
  }, []);

  // ── Back navigation ──
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // ── Loading / error states for task fetch ──
  if (isLoadingTask) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (taskError || !codingTask?.id) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center space-y-4">
          <p className="text-sm text-red-400">
            Failed to load workspace. Please go back and try again.
          </p>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-4 py-2 text-sm rounded bg-[#007acc] text-white hover:bg-[#005fa3] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* ── Title bar ── */}
      <div className="flex items-center gap-3 px-3 h-[36px] bg-[#323233] border-b border-[#2d2d2d] flex-shrink-0">
        <button
          type="button"
          onClick={handleGoBack}
          className="flex items-center gap-1 text-[13px] text-[#cccccc] hover:text-white transition-colors cursor-pointer"
          title="Go back"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <div className="w-px h-4 bg-[#555]" />
        <span className="text-[13px] text-[#cccccc] truncate">
          {codingTask.description
            ? codingTask.description.slice(0, 60)
            : 'IDE Workspace'}
        </span>
      </div>

      {/* ── Main IDE layout ── */}
      <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
        <PanelGroup orientation="horizontal" style={{ height: '100%', width: '100%' }}>
          {/* ── Left: File Explorer ── */}
          <Panel defaultSize={20} minSize={15} maxSize={40}>
            {containerId ? (
              <FileTree
                containerId={containerId}
                activeFilePath={selectedFile}
                onSelectFile={handleSelectFile}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-[#1e1e1e] gap-2">
                <Loader2 size={20} className="animate-spin text-gray-500" />
                <p className="text-xs text-gray-600">Waiting for container...</p>
              </div>
            )}
          </Panel>

          <PanelResizeHandle className="w-[3px] bg-[#2d2d2d] hover:bg-[#007acc] transition-colors" />

          {/* ── Right: Editor + Terminal ── */}
          <Panel defaultSize={80}>
            <PanelGroup orientation="vertical" style={{ height: '100%', width: '100%' }}>
              {/* ── Top Right: Monaco Editor ── */}
              <Panel defaultSize={60} minSize={30}>
                <div className="h-full flex flex-col bg-[#1e1e1e]">
                  {/* Tab bar */}
                  {selectedFile && (
                    <div className="flex items-center gap-2 px-3 h-[35px] bg-[#252526] border-b border-[#2d2d2d] text-[13px] text-[#cccccc] shrink-0">
                      <span className="truncate">{selectedFile}</span>
                      {isSaving && (
                        <Loader2 size={12} className="animate-spin text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* Editor area */}
                  <div className="flex-1 min-h-0">
                    {isLoadingFile ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-gray-500" />
                      </div>
                    ) : selectedFile ? (
                      <Editor
                        language={getLanguageFromPath(selectedFile)}
                        theme="vs-dark"
                        value={fileContent}
                        onChange={handleEditorChange}
                        onMount={handleEditorMount}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          fontFamily: "'Fira Code', Menlo, Monaco, 'Courier New', monospace",
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          wordWrap: 'on',
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                        Select a file to start editing
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-[3px] bg-[#2d2d2d] hover:bg-[#007acc] transition-colors" />

              {/* ── Bottom Right: Terminal ── */}
              <Panel defaultSize={40} minSize={20}>
                <Terminal
                  taskId={codingTask.id}
                  onSessionCreated={setContainerId}
                />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
