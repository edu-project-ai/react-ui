import { useState, useMemo } from 'react';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { useIdeStore } from '../store/useIdeStore';

export function BrowserPreview() {
  const containerId = useIdeStore((s) => s.containerId);
  const mappedPorts = useIdeStore((s) => s.mappedPorts);
  
  const [addressInput, setAddressInput] = useState('8000');
  const [currentRoute, setCurrentRoute] = useState({ port: '8000', path: '/' });
  const [refreshKey, setRefreshKey] = useState(0);

  // Parse the user input to extract port and path
  const parseAddress = (input: string) => {
    let cleaned = input.trim();
    cleaned = cleaned.replace(/^https?:\/\//, '');
    cleaned = cleaned.replace(/^localhost:/, '');
    
    // matches "8000" or "8000/api/test"
    const match = cleaned.match(/^(\d+)(.*)$/);
    if (match) {
      return { port: match[1], path: match[2] || '/' };
    }
    return { port: '8000', path: '/' };
  };

  // Generate the proxy URL using path-based routing
  // Format: {proxyBase}/proxy/{containerId}/{port}/{path}
  const previewUrl = useMemo(() => {
    if (!containerId || !currentRoute.port) return '';

    const wsUrl = import.meta.env.VITE_WS_PROXY_URL || 'ws://localhost:8080';
    const httpUrl = wsUrl.replace(/^ws/, 'http');

    try {
      const parsed = new URL(httpUrl);
      const cleanPath = currentRoute.path.startsWith('/') ? currentRoute.path : `/${currentRoute.path}`;
      // Path-based proxy: /proxy/{containerId}/{port}{path}
      return `${parsed.protocol}//${parsed.host}/proxy/${containerId}/${currentRoute.port}${cleanPath}`;
    } catch {
      return '';
    }
  }, [containerId, currentRoute]);

  // Determine local mapped URL for external browser fallback
  const mappedExternalPort = mappedPorts?.[currentRoute.port];
  const localUrl = mappedExternalPort ? `http://localhost:${mappedExternalPort}${currentRoute.path.startsWith('/') ? currentRoute.path : `/${currentRoute.path}`}` : undefined;

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleApplyAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseAddress(addressInput);
    setCurrentRoute(parsed);
  };

  if (!containerId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#1e1e1e] text-[#cccccc]">
        <Globe size={48} className="text-[#3c3c3c] mb-4" />
        <p>Start a session to use the browser preview</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] border-l border-[#2d2d2d]">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#2d2d2d]">
        <button
          type="button"
          onClick={handleRefresh}
          className="p-1.5 rounded hover:bg-[#3c3c3c] transition-colors cursor-pointer text-gray-300 hover:text-white"
          title="Reload"
        >
          <RefreshCw size={14} />
        </button>

        <form onSubmit={handleApplyAddress} className="flex flex-1 items-center bg-[#1e1e1e] rounded px-2 h-7 border border-[#3c3c3c] overflow-hidden">
          <span className="text-[#858585] text-xs mr-2 select-none">URL:</span>
          <input
            type="text"
            className="bg-transparent text-sm w-full outline-none font-mono text-[#cccccc] placeholder:text-[#555555]"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="e.g. 5173/api/test"
          />
        </form>

        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded hover:bg-[#3c3c3c] transition-colors cursor-pointer text-gray-300 hover:text-white"
          title="Open Proxy URL in new tab"
        >
          <ExternalLink size={14} />
        </a>

        {localUrl && (
          <a
            href={localUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded hover:bg-[#3c3c3c] transition-colors cursor-pointer text-[#4facfe] hover:text-[#5ce0ff]"
            title={`Open local mapped port (localhost:${mappedExternalPort}) in new tab`}
          >
            <Globe size={14} />
          </a>
        )}
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-white">
        {previewUrl ? (
          <iframe
            key={refreshKey}
            src={previewUrl}
            className="w-full h-full border-none"
            title="Browser Preview"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            allow="clipboard-read; clipboard-write"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-[#1e1e1e]">
            Invalid URL config
          </div>
        )}
      </div>
    </div>
  );
}
