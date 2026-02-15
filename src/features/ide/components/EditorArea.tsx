import { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import { useIdeStore } from '../store/useIdeStore';
import { useMonacoModels } from '../hooks/useMonacoModels';
import { readFile } from '../api/fsApi';
import { EditorTabs } from './EditorTabs';
import '../styles/ide.css';

export function EditorArea() {
  const activeFilePath = useIdeStore((s) => s.activeFilePath);
  const containerId = useIdeStore((s) => s.containerId);
  const tabs = useIdeStore((s) => s.tabs);
  const closeTab = useIdeStore((s) => s.closeTab);

  const { editorRef, switchToFile, saveRef, disposeModel } = useMonacoModels();

  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const editorMounted = useRef(false);
  const loadedFiles = useRef<Set<string>>(new Set());

  // Load file content and switch model when active file changes
  useEffect(() => {
    if (!activeFilePath || !containerId || !editorMounted.current) return;

    let cancelled = false;

    const load = async () => {
      // If model already exists (file was previously loaded), just switch
      if (loadedFiles.current.has(activeFilePath)) {
        switchToFile(activeFilePath, '');
        return;
      }

      setIsLoadingFile(true);
      try {
        const content = await readFile(containerId, activeFilePath);
        if (cancelled) return;
        loadedFiles.current.add(activeFilePath);
        switchToFile(activeFilePath, content);
      } catch {
        // File load failed - still switch to show empty editor
        if (!cancelled) {
          loadedFiles.current.add(activeFilePath);
          switchToFile(activeFilePath, '');
        }
      } finally {
        if (!cancelled) setIsLoadingFile(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeFilePath, containerId, switchToFile]);

  // Clean up model when tab is closed
  const originalCloseTab = closeTab;
  const handleCloseTab = useCallback(
    (path: string) => {
      disposeModel(path);
      loadedFiles.current.delete(path);
      originalCloseTab(path);
    },
    [disposeModel, originalCloseTab],
  );

  // Override closeTab in store temporarily - we need to dispose models
  // Actually, let's handle this via effect on tabs change instead
  useEffect(() => {
    // Track removed tabs to dispose their models
    const currentPaths = new Set(tabs.map((t) => t.path));
    for (const loadedPath of loadedFiles.current) {
      if (!currentPaths.has(loadedPath)) {
        disposeModel(loadedPath);
        loadedFiles.current.delete(loadedPath);
      }
    }
  }, [tabs, disposeModel]);

  const handleEditorMount: OnMount = useCallback(
    (editor, monacoInstance) => {
      editorRef.current = editor;
      editorMounted.current = true;

      // Register Ctrl+S
      editor.addCommand(
        monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
        () => {
          saveRef.current?.();
        },
      );

      // If there's an active file waiting to be loaded, trigger it
      const { activeFilePath: currentActive, containerId: currentContainer } =
        useIdeStore.getState();
      if (currentActive && currentContainer) {
        readFile(currentContainer, currentActive)
          .then((content) => {
            loadedFiles.current.add(currentActive);
            switchToFile(currentActive, content);
          })
          .catch(() => {
            loadedFiles.current.add(currentActive);
            switchToFile(currentActive, '');
          });
      }
    },
    [editorRef, saveRef, switchToFile],
  );

  const hasTabs = tabs.length > 0;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <EditorTabs />

      <div className="flex-1 min-h-0 relative">
        {isLoadingFile && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1e1e1e]">
            <Loader2 size={24} className="animate-spin text-gray-500" />
          </div>
        )}

        {hasTabs ? (
          <Editor
            theme="vs-dark"
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily:
                "'Fira Code', Menlo, Monaco, 'Courier New', monospace",
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              // Disable features that can cause iterator issues
              quickSuggestions: { other: true, comments: false, strings: false },
              suggest: {
                showStatusBar: true,
              },
              // Ensure proper model handling
              readOnly: false,
              domReadOnly: false,
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Select a file to start editing
          </div>
        )}
      </div>
    </div>
  );
}
