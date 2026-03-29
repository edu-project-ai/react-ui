import { Loader2, CaseSensitive, WholeWord, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useSearch } from '../hooks/useSearch';

export function SearchPane() {
  const {
    query,
    matchCase,
    matchWord,
    loading,
    error,
    groupedResults,
    handleInputChange,
    setMatchCase,
    setMatchWord,
    handleResultClick,
  } = useSearch();

  // local state to manage expanded/collapsed files
  const [collapsedFiles, setCollapsedFiles] = useState<Record<string, boolean>>({});

  const toggleFile = (file: string) => {
    setCollapsedFiles((prev) => ({
      ...prev,
      [file]: !prev[file],
    }));
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
      <div className="sidebar-header">
        <span>Search</span>
      </div>

      <div className="p-2 flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-2 pr-16 py-1 bg-[#3c3c3c] text-[#cccccc] border border-[#555] rounded text-sm focus:outline-none focus:border-[#007acc]"
            placeholder="Search in files..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <div className="absolute right-1 top-1 flex gap-1">
            <button
              className={`p-0.5 rounded cursor-pointer ${matchCase ? 'bg-[#007acc] text-white' : 'text-gray-400 hover:text-white hover:bg-[#555]'}`}
              onClick={() => setMatchCase(!matchCase)}
              title="Match Case"
            >
              <CaseSensitive size={16} />
            </button>
            <button
              className={`p-0.5 rounded cursor-pointer ${matchWord ? 'bg-[#007acc] text-white' : 'text-gray-400 hover:text-white hover:bg-[#555]'}`}
              onClick={() => setMatchWord(!matchWord)}
              title="Match Whole Word"
            >
              <WholeWord size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 size={20} className="animate-spin text-gray-500" />
          </div>
        )}

        {error && <div className="p-4 text-sm text-red-400">{error}</div>}

        {!loading && !error && query && Object.keys(groupedResults).length === 0 && (
          <div className="p-4 text-sm text-gray-500">No results found</div>
        )}

        {!loading && !error && Object.entries(groupedResults).length > 0 && (
          <div>
            {Object.entries(groupedResults).map(([file, matches]) => {
              const isCollapsed = collapsedFiles[file];
              return (
                <div key={file} className="mb-1">
                  <div 
                    className="px-2 py-1 text-xs font-semibold text-[#cccccc] hover:bg-[#2a2d2e] cursor-pointer flex items-center gap-1 group"
                    onClick={() => toggleFile(file)}
                  >
                    {isCollapsed ? (
                      <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-400 group-hover:text-white" />
                    )}
                    <span className="truncate flex-1">{file}</span>
                    <span className="text-[#858585]
                      px-1.5 rounded-full bg-[#3c3c3c] text-[10px]"
                    >
                      {matches.length}
                    </span>
                  </div>
                  {!isCollapsed && matches.map((match, i) => (
                    <div
                      key={i}
                      className="pl-6 pr-2 py-1 text-xs hover:bg-[#2a2d2e] cursor-pointer flex items-start gap-2"
                      onClick={() => handleResultClick(match)}
                      title="Click to open file"
                    >
                      <span className="text-[#858585] flex-shrink-0">
                        {match.line}:
                      </span>
                      <span className="text-[#cccccc] break-all">
                        {match.text}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {!query && (
          <div className="p-4 text-sm text-gray-500">
            Enter a search query to find text in files
          </div>
        )}
      </div>
    </div>
  );
}
