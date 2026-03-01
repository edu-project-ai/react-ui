import { Loader2 } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';

export function SearchPane() {
  const {
    query,
    loading,
    error,
    groupedResults,
    handleInputChange,
    handleResultClick,
  } = useSearch();

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
      <div className="sidebar-header">
        <span>Search</span>
      </div>

      <div className="p-2">
        <input
          type="text"
          className="w-full px-2 py-1 bg-[#3c3c3c] text-[#cccccc] border border-[#555] rounded text-sm focus:outline-none focus:border-[#007acc]"
          placeholder="Search in files..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
        />
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
            {Object.entries(groupedResults).map(([file, matches]) => (
              <div key={file} className="mb-2">
                <div className="px-2 py-1 text-xs font-semibold text-[#cccccc] bg-[#2d2d30] flex items-center gap-2">
                  <i className="codicon codicon-file-code" />
                  <span>{file}</span>
                  <span className="text-[#858585]">({matches.length})</span>
                </div>
                {matches.map((match, i) => (
                  <div
                    key={i}
                    className="px-4 py-1 text-xs hover:bg-[#2a2d2e] cursor-pointer flex items-start gap-2"
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
            ))}
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
