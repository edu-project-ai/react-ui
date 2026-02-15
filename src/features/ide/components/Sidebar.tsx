import { Loader2 } from 'lucide-react';
import { useIdeStore } from '../store/useIdeStore';
import { FileTree } from './FileTree';
import { SearchPane } from './SearchPane';

export function Sidebar() {
  const containerId = useIdeStore((s) => s.containerId);
  const activeSidebarPanel = useIdeStore((s) => s.activeSidebarPanel);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] overflow-hidden">
      {!containerId ? (
        <div className="h-full flex flex-col items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin text-gray-500" />
          <p className="text-xs text-gray-600">Waiting for container...</p>
        </div>
      ) : (
        <>
          {activeSidebarPanel === 'explorer' && (
            <FileTree containerId={containerId} />
          )}
          {activeSidebarPanel === 'search' && <SearchPane />}
        </>
      )}
    </div>
  );
}
