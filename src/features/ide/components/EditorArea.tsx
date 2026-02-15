import { useCallback, useEffect, useRef, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import { useIdeStore } from '../store/useIdeStore';
import { readFile, writeFile } from '../api/fsApi';
import { EditorTabs } from './EditorTabs';
import { StatusBar } from './StatusBar';
import { getLanguageFromPath } from '../utils/languageMap';
import '../styles/ide.css';

export function EditorArea() {
  const activeFilePath = useIdeStore((s) => s.activeFilePath);
  const containerId = useIdeStore((s) => s.containerId);
  const tabs = useIdeStore((s) => s.tabs);

  // Local state
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{
    line: number;
    column: number;
  } | null>(null);

  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (!activeFilePath || !containerId) return;

    const loadContent = async () => {
      setIsLoading(true);
      try {
        const content = await readFile(containerId, activeFilePath);
        setFileContent(content);
      } catch (error) {
        console.error("Failed to load file:", error);
        setFileContent(''); // Або показати помилку
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [activeFilePath, containerId]);

  // Збереження файлу (Ctrl+S)
  const handleSave = useCallback(async () => {
    if (!containerId || !activeFilePath || !editorRef.current) return;

    const content = editorRef.current.getValue();
    try {
      await writeFile(containerId, activeFilePath, content);
      // Можна додати toast.success("Saved")
    } catch (error) {
      console.error("Failed to save:", error);
      // toast.error("Failed to save")
    }
  }, [containerId, activeFilePath]);

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // Track cursor position
      editor.onDidChangeCursorPosition((e) => {
        setCursorPosition({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      });

      // Register Ctrl+S
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        () => {
          handleSave();
        }
      );
    },
    [handleSave]
  );

  // Оновлюємо ref контенту при змінах
  const handleEditorChange = (value: string | undefined) => {
    // Тут можна оновлювати unsaved changes indicator в табах
  };

  const hasTabs = tabs.length > 0;
  const language = activeFilePath ? getLanguageFromPath(activeFilePath) : null;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <EditorTabs />

      <div className="flex-1 min-h-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1e1e1e]">
            <Loader2 size={24} className="animate-spin text-gray-500" />
          </div>
        )}

        {hasTabs && activeFilePath ? (
          <Editor
            key={activeFilePath}
            path={activeFilePath}
            defaultLanguage={getLanguageFromPath(activeFilePath)}
            theme="vs-dark"
            value={fileContent}
            onMount={handleEditorMount}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', Menlo, Monaco, 'Courier New', monospace",
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 10 },
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Select a file to start editing
          </div>
        )}
      </div>

      <StatusBar language={language} cursorPosition={cursorPosition} />
    </div>
  );
}