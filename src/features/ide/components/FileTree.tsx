import { useCallback, useEffect, useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  File,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { fetchFileTree, type FileNode } from '../api/fsApi';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.go', '.py', '.rs',
  '.java', '.c', '.cpp', '.h', '.cs', '.rb', '.php',
  '.swift', '.kt', '.scala', '.sh', '.bash', '.zsh',
  '.json', '.yaml', '.yml', '.toml', '.xml', '.html',
  '.css', '.scss', '.less', '.sql', '.graphql', '.proto',
  '.vue', '.svelte', '.md', '.mdx',
]);

function isCodeFile(name: string): boolean {
  const dot = name.lastIndexOf('.');
  if (dot < 0) return false;
  return CODE_EXTENSIONS.has(name.slice(dot).toLowerCase());
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FileTreeProps {
  containerId: string;
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
}

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  activeFilePath: string | null;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onSelectFile: (path: string) => void;
}

// ─────────────────────────────────────────────
// TreeNode (recursive)
// ─────────────────────────────────────────────

function TreeNode({
  node,
  depth,
  activeFilePath,
  expandedPaths,
  onToggle,
  onSelectFile,
}: TreeNodeProps) {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedPaths.has(node.path);
  const isActive = node.path === activeFilePath;

  const handleClick = () => {
    if (isFolder) {
      onToggle(node.path);
    } else {
      onSelectFile(node.path);
    }
  };

  const Icon = isFolder
    ? isExpanded
      ? FolderOpen
      : Folder
    : isCodeFile(node.name)
      ? FileCode
      : File;

  const iconColor = isFolder
    ? 'text-amber-400'
    : isCodeFile(node.name)
      ? 'text-blue-400'
      : 'text-gray-400';

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={`
          flex items-center w-full gap-1 px-2 py-[3px] text-left text-[13px]
          hover:bg-[#2a2d2e] transition-colors duration-75 cursor-pointer
          ${isActive ? 'bg-[#37373d] text-white' : 'text-[#cccccc]'}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          isExpanded ? (
            <ChevronDown size={14} className="shrink-0 text-gray-500" />
          ) : (
            <ChevronRight size={14} className="shrink-0 text-gray-500" />
          )
        ) : (
          <span className="w-[14px] shrink-0" />
        )}
        <Icon size={16} className={`shrink-0 ${iconColor}`} />
        <span className="truncate">{node.name}</span>
      </button>

      {isFolder && isExpanded && node.children && (
        <div>
          {(node.children ?? []).map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFilePath={activeFilePath}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// FileTree
// ─────────────────────────────────────────────

export function FileTree({ containerId, activeFilePath, onSelectFile }: FileTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const loadTree = useCallback(async () => {
    if (!containerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFileTree(containerId);

      // Debug logging
      console.log('[FileTree] Raw API response:', data);

      // Robust validation
      if (!data) {
        console.warn('[FileTree] Received null/undefined, using empty array');
        setTree([]);
      } else if (!Array.isArray(data)) {
        console.error('[FileTree] Received non-array data:', typeof data, data);
        setError('Invalid data format received from server');
        setTree([]);
      } else {
        setTree(data);
      }
    } catch (err) {
      console.error('[FileTree] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load file tree');
      setTree([]); // Always ensure tree is an array
    } finally {
      setLoading(false);
    }
  }, [containerId]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#bbbbbb] border-b border-[#2d2d2d]">
        <span>Explorer</span>
        <button
          type="button"
          onClick={loadTree}
          disabled={loading}
          className="p-1 rounded hover:bg-[#2a2d2e] disabled:opacity-40 cursor-pointer"
          title="Refresh file tree"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {loading && tree.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gray-500" />
          </div>
        )}

        {error && (
          <div className="px-3 py-4 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        {!loading && !error && tree.length === 0 && (
          <div className="px-3 py-4 text-xs text-gray-500 text-center">
            No files found
          </div>
        )}

        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            activeFilePath={activeFilePath}
            expandedPaths={expandedPaths}
            onToggle={handleToggle}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    </div>
  );
}
