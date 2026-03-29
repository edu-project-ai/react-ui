import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Allotment } from 'allotment';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { useGetCodingTaskQuery } from '@/features/learning-paths';
import { useIdeStore } from '../store/useIdeStore';
import { useDeleteSessionMutation } from '../api/codeExecutionApi';
import { ActivityBar } from '../components/ActivityBar';
import { Sidebar } from '../components/Sidebar';
import { EditorArea } from '../components/EditorArea';
import { Terminal } from '../components/terminal/Terminal';
import { BrowserPreview } from '../components/BrowserPreview';
import '../styles/ide.css';

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

  // ── Zustand store ──
  const sidebarVisible = useIdeStore((s) => s.sidebarVisible);
  const browserVisible = useIdeStore((s) => s.browserVisible);
  const setSessionInfo = useIdeStore((s) => s.setSessionInfo);
  const containerId = useIdeStore((s) => s.containerId);
  const reset = useIdeStore((s) => s.reset);
  const [deleteSession] = useDeleteSessionMutation();

  // Cleanup container session on unmount and beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (containerId) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_BASE_URL}/api/code-execution/sessions`,
          JSON.stringify({ _method: 'DELETE' }),
        );
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (containerId) {
        deleteSession();
      }
      reset();
    };
  }, [containerId, deleteSession, reset]);

  // ── Prevent browser Ctrl+S ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Session created callback ──
  const handleSessionCreated = useCallback(
    (containerId: string, mappedPorts?: Record<string, number>) => {
      setSessionInfo(containerId, mappedPorts);
    },
    [setSessionInfo],
  );

  // ── Back navigation ──
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // ── Loading / error states ──
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
    <div className="h-screen w-screen bg-[#1e1e1e] overflow-hidden flex flex-col">
      {/* ── Title bar ── */}
      <div className="flex items-center gap-3 px-3 h-[36px] bg-[#323233] border-b border-[#2d2d2d] shrink-0">
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
      <div className="flex-1 min-h-0 flex">
        {/* Activity Bar (fixed width, outside allotment) */}
        <ActivityBar />

        {/* Resizable panels */}
        <div className="flex-1 min-w-0 ide-layout">
          <Allotment>
            {/* Sidebar */}
            <Allotment.Pane
              minSize={200}
              preferredSize={240}
              visible={sidebarVisible}
            >
              <Sidebar />
            </Allotment.Pane>

            {/* Editor + Terminal (vertical split) & Browser Preview */}
            <Allotment.Pane>
              <Allotment>
                {/* Editor & Terminal Column */}
                <Allotment.Pane>
                  <Allotment vertical>
                    {/* Editor Area */}
                    <Allotment.Pane minSize={100}>
                      <EditorArea />
                    </Allotment.Pane>

                    {/* Terminal */}
                    <Allotment.Pane minSize={80} preferredSize={200}>
                      <div className="h-full bg-black overflow-hidden">
                        <Terminal
                          taskId={codingTask.id}
                          onSessionCreated={handleSessionCreated}
                        />
                      </div>
                    </Allotment.Pane>
                  </Allotment>
                </Allotment.Pane>

                {/* Browser Preview (Optional split right) */}
                <Allotment.Pane
                  minSize={300}
                  preferredSize={400}
                  visible={browserVisible}
                >
                  <BrowserPreview />
                </Allotment.Pane>
              </Allotment>
            </Allotment.Pane>
          </Allotment>
        </div>
      </div>
    </div>
  );
}
