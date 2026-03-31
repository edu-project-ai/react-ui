import { Play, Bot } from 'lucide-react';
import { useIdeStore } from '../store/useIdeStore';

interface IdeToolbarProps {
  onRunTests: () => void;
  language?: string;
}

export function IdeToolbar({ onRunTests, language }: IdeToolbarProps) {
  const blipVisible = useIdeStore((s) => s.blipPanelVisible);
  const toggleBlip = useIdeStore((s) => s.toggleBlipPanel);

  return (
    <div className="flex items-center gap-1 ml-auto">
      <button
        type="button"
        onClick={onRunTests}
        className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] text-[#cccccc] hover:bg-[#3e3e3e] rounded transition-colors"
        title={`Run Tests (${language ?? 'auto-detect'})`}
      >
        <Play size={13} className="text-[#4ec9b0]" />
        <span>Run Tests</span>
      </button>

      <button
        type="button"
        onClick={toggleBlip}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-[12px] rounded transition-colors ${
          blipVisible
            ? 'bg-[#37373d] text-white'
            : 'text-[#cccccc] hover:bg-[#3e3e3e]'
        }`}
        title="Blip Helper"
      >
        <Bot size={13} className="text-[#dbb8ff]" />
        <span>Blip Helper</span>
      </button>
    </div>
  );
}
