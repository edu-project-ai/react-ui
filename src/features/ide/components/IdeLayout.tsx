import { useCallback, useRef, useState } from 'react';
import Split from 'react-split';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { FileTree } from './FileTree';
import { Terminal } from './terminal/Terminal';
import { readFile, writeFile } from '../api/fsApi';

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

interface IdeLayoutProps {
  containerId: string | null;
  taskId: string;
  onSessionCreated?: (containerId: string) => void;
}

export function IdeLayout({ containerId, taskId, onSessionCreated }: IdeLayoutProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editorContentRef = useRef('');
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);

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

  const handleEditorChange = useCallback((value: string | undefined) => {
    editorContentRef.current = value ?? '';
  }, []);

  return (
    <>
      <style>{`
        .gutter {
          background-color: #2d2d2d;
          background-repeat: no-repeat;
          background-position: 50%;
          z-index: 10; /* Щоб повзунок був завжди зверху */
        }
        .gutter:hover {
          background-color: #007acc;
          transition: background-color 0.2s;
        }
        .gutter.gutter-horizontal {
          cursor: col-resize;
        }
        .gutter.gutter-vertical {
          cursor: row-resize;
        }
        .split-horizontal {
          display: flex;
          flex-direction: row;
        }
        .split-vertical {
          display: flex;
          flex-direction: column;
        }
      `}</style>

      <div className="h-screen w-screen bg-[#1e1e1e] overflow-hidden text-[#cccccc]">
        <Split
          className="split-horizontal h-full"
          sizes={[20, 80]}
          minSize={[200, 300]} 
          expandToMin={false}
          gutterSize={4}
          snapOffset={0} 
          direction="horizontal"
          cursor="col-resize"
        >
          <div className="h-full bg-[#1e1e1e] overflow-hidden flex flex-col border-r border-[#2d2d2d]">
            {containerId ? (
              <FileTree
                containerId={containerId}
                activeFilePath={selectedFile}
                onSelectFile={handleSelectFile}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-gray-500" />
              </div>
            )}
          </div>

          <div className="h-full bg-[#1e1e1e] overflow-hidden flex flex-col min-w-0">
            <Split
              className="split-vertical h-full"
              sizes={[70, 30]}
              minSize={[100, 100]} 
              maxSize={[Infinity, Infinity]}
              gutterSize={4}
              snapOffset={0}
              direction="vertical"
              cursor="row-resize"
            >
              <div className="h-full flex flex-col bg-[#1e1e1e] overflow-hidden min-h-0">
                {selectedFile && (
                  <div className="flex items-center gap-2 px-3 h-[35px] bg-[#252526] border-b border-[#2d2d2d] text-[13px] text-[#cccccc] shrink-0">
                    <span className="truncate">{selectedFile}</span>
                    {isSaving && (
                      <Loader2 size={12} className="animate-spin text-gray-400" />
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-hidden relative">
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

              <div className="h-full bg-black overflow-hidden relative min-h-0">
                <Terminal
                  taskId={taskId}
                  onSessionCreated={onSessionCreated}
                />
              </div>
            </Split>
          </div>
        </Split>
      </div>
    </>
  );
}