import { useRef, useCallback, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import type { editor as MonacoEditor } from 'monaco-editor';
import toast from 'react-hot-toast';
import { getLanguageFromPath } from '../utils/languageMap';
import { useWriteFileMutation } from '../api/ideProxyApi';
import { useIdeStore } from '../store/useIdeStore';

function fileUri(path: string): monaco.Uri {
  return monaco.Uri.parse(`file:///${path}`);
}

export function useMonacoModels() {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const viewStates = useRef<Map<string, MonacoEditor.ICodeEditorViewState>>(
    new Map(),
  );
  const contentListeners = useRef<Map<string, monaco.IDisposable>>(new Map());
  const saveRef = useRef<(() => Promise<void>) | null>(null);

  const [triggerWriteFile] = useWriteFileMutation();

  // Keep save function fresh via ref
  useEffect(() => {
    saveRef.current = async () => {
      const editor = editorRef.current;
      if (!editor) return;

      const model = editor.getModel();
      if (!model) return;

      const { containerId, activeFilePath, markClean, setSavedContent } =
        useIdeStore.getState();
      if (!containerId || !activeFilePath) return;

      try {
        const content = model.getValue();
        await triggerWriteFile({ containerId, path: activeFilePath, content }).unwrap();
        setSavedContent(activeFilePath, content);
        markClean(activeFilePath);
      } catch (err) {
        toast.error(
          `Save failed: ${err instanceof Error ? err.message : 'unknown error'}`,
        );
      }
    };
  });

  const switchToFile = useCallback((path: string, content: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    try {
      // Save current view state before switching
      const currentModel = editor.getModel();
      if (currentModel) {
        const currentPath = currentModel.uri.path.slice(1); // remove leading /
        try {
          const vs = editor.saveViewState();
          if (vs) {
            viewStates.current.set(currentPath, vs);
          }
        } catch (err) {
          // saveViewState can fail, just log and continue
          console.warn('Failed to save view state:', err);
        }
      }

      const uri = fileUri(path);
      let model = monaco.editor.getModel(uri);

      if (!model) {
        const language = getLanguageFromPath(path);
        model = monaco.editor.createModel(content, language, uri);

        // Store initial saved content
        useIdeStore.getState().setSavedContent(path, content);

        // Set up dirty detection with smart checking
        const listener = model.onDidChangeContent(() => {
          const currentContent = model?.getValue() ?? '';
          useIdeStore.getState().checkDirtyState(path, currentContent);
        });
        contentListeners.current.set(path, listener);
      }

      editor.setModel(model);

      // Restore view state if we had one - wrap in try/catch
      const savedViewState = viewStates.current.get(path);
      if (savedViewState) {
        try {
          editor.restoreViewState(savedViewState);
        } catch (err) {
          // ViewState restoration can fail, ignore and continue
          console.warn('Failed to restore view state:', err);
          viewStates.current.delete(path); // Clear invalid state
        }
      }

      editor.focus();
    } catch (err) {
      console.error('Error switching to file:', err);
      toast.error('Failed to switch file');
    }
  }, []);

  const disposeModel = useCallback((path: string) => {
    const uri = fileUri(path);
    const model = monaco.editor.getModel(uri);
    if (model) {
      // Clear from editor before disposing to prevent "V is not iterable" crash
      if (editorRef.current?.getModel() === model) {
        editorRef.current.setModel(null);
      }
      model.dispose();
    }
    // Clean up view state when disposing model
    viewStates.current.delete(path);
    const listener = contentListeners.current.get(path);
    if (listener) {
      listener.dispose();
      contentListeners.current.delete(path);
    }
  }, []);

  const disposeAll = useCallback(() => {
    for (const [, listener] of contentListeners.current) {
      listener.dispose();
    }
    contentListeners.current.clear();
    viewStates.current.clear();

    // Dispose all models created by us (file:/// scheme)
    for (const model of monaco.editor.getModels()) {
      if (model.uri.scheme === 'file') {
        model.dispose();
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeAll();
    };
  }, [disposeAll]);

  return { editorRef, switchToFile, saveRef, disposeModel, disposeAll };
}
