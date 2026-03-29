import { useCallback, useEffect, useRef, useState } from 'react';
import Editor, { type OnMount, loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { Loader2 } from 'lucide-react';

// Vital fix: Tell @monaco-editor/react to use our local 'monaco-editor' NPM package
// instead of dynamically downloading from CDN. Without this, local models created via 
// monaco.editor.createModel clash with the CDN editor instance, crushing syntax highlighting
// and throwing "V is not iterable" due to prototype/instance mismatches.
loader.config({ monaco });
import { useIdeStore } from '../store/useIdeStore';
import { useLazyReadFileQuery } from '../api/ideProxyApi';
import { useMonacoModels } from '../hooks/useMonacoModels';
import { EditorTabs } from './EditorTabs';
import { StatusBar } from './StatusBar';
import { getLanguageFromPath } from '../utils/languageMap';
import type { CursorPosition } from '../types';
import '../styles/ide.css';

export function EditorArea() {
  const activeFilePath = useIdeStore((s) => s.activeFilePath);
  const containerId = useIdeStore((s) => s.containerId);
  const tabs = useIdeStore((s) => s.tabs);

  const { editorRef, switchToFile, saveRef, disposeModel } = useMonacoModels();

  const [triggerReadFile] = useLazyReadFileQuery();

  const [isLoading, setIsLoading] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(
    null,
  );

  // Track previous tabs to detect closures and dispose models
  const prevTabsRef = useRef<typeof tabs>([]);
  useEffect(() => {
    const prevPaths = new Set(prevTabsRef.current.map((t) => t.path));
    const currPaths = new Set(tabs.map((t) => t.path));
    for (const path of prevPaths) {
      if (!currPaths.has(path)) {
        disposeModel(path);
      }
    }
    prevTabsRef.current = tabs;
  }, [tabs, disposeModel]);

  // Load file content and switch Monaco model when active file or editor readiness changes
  useEffect(() => {
    if (!activeFilePath || !containerId || !editorReady) return;
    
    // Fast path: if we already have the model in memory, switch immediately
    // This avoids a network request, prevents "V is not iterable" by not holding onto
    // a disposed model during the file load, and preserves unsaved changes.
    const uri = monaco.Uri.parse(`file:///${activeFilePath}`);
    if (monaco.editor.getModel(uri)) {
      switchToFile(activeFilePath, ''); // content is ignored in switchToFile if model exists
      return;
    }

    let cancelled = false;
    const loadAndSwitch = async () => {
      setIsLoading(true);
      try {
        const content = await triggerReadFile({ containerId, path: activeFilePath }).unwrap();
        if (!cancelled) {
          switchToFile(activeFilePath, content);
        }
      } catch (error) {
        console.error('Failed to load file:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadAndSwitch();
    return () => {
      cancelled = true;
    };
  }, [activeFilePath, containerId, editorReady, switchToFile, triggerReadFile]);

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      editor.onDidChangeCursorPosition((e) => {
        setCursorPosition({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      });

      // Use saveRef so the keybinding always calls the latest save function
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        saveRef.current?.();
      });

      setEditorReady(true);
    },
    [editorRef, saveRef],
  );

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
            theme="vs-dark"
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
