import { Loader2 } from 'lucide-react';
import { useIdeStore } from '../store/useIdeStore';
import { FileTree } from './FileTree';

export function Sidebar() {
  const containerId = useIdeStore((s) => s.containerId);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] overflow-hidden">
      {containerId ? (
        <FileTree containerId={containerId} />
      ) : (
        <div className="h-full flex flex-col items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin text-gray-500" />
          <p className="text-xs text-gray-600">Waiting for container...</p>
        </div>
      )}
    </div>
  );
}
