import { useCallback, useEffect, useState } from 'react';
import { Tree } from 'react-arborist';
import type { NodeRendererProps } from 'react-arborist';
import { RefreshCw, Loader2 } from 'lucide-react';
import { fetchFileTree } from '../api/fsApi';
import type { FileNode } from '../api/fsApi';
import { useIdeStore } from '../store/useIdeStore';
import '../styles/ide.css';

// ─────────────────────────────────────────────
// Icon mapping by file extension
// ─────────────────────────────────────────────

const EXT_ICON_MAP: Record<string, string> = {
  '.ts': 'codicon-file-code',
  '.tsx': 'codicon-file-code',
  '.js': 'codicon-file-code',
  '.jsx': 'codicon-file-code',
  '.py': 'codicon-file-code',
  '.go': 'codicon-file-code',
  '.rs': 'codicon-file-code',
  '.java': 'codicon-file-code',
  '.c': 'codicon-file-code',
  '.cpp': 'codicon-file-code',
  '.cs': 'codicon-file-code',
  '.rb': 'codicon-file-code',
  '.php': 'codicon-file-code',
  '.swift': 'codicon-file-code',
  '.kt': 'codicon-file-code',
  '.sh': 'codicon-symbol-event',
  '.bash': 'codicon-symbol-event',
  '.json': 'codicon-json',
  '.yaml': 'codicon-file-code',
  '.yml': 'codicon-file-code',
  '.html': 'codicon-file-code',
  '.css': 'codicon-file-code',
  '.scss': 'codicon-file-code',
  '.md': 'codicon-markdown',
  '.mdx': 'codicon-markdown',
  '.svg': 'codicon-file-media',
  '.png': 'codicon-file-media',
  '.jpg': 'codicon-file-media',
  '.gif': 'codicon-file-media',
  '.toml': 'codicon-settings-gear',
  '.xml': 'codicon-file-code',
  '.sql': 'codicon-database',
};

function getFileIcon(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot < 0) return 'codicon-file';
  const ext = name.slice(dot).toLowerCase();
  return EXT_ICON_MAP[ext] ?? 'codicon-file';
}

// ─────────────────────────────────────────────
// Convert API FileNode to react-arborist data
// ─────────────────────────────────────────────

interface TreeData {
  id: string;
  name: string;
  children?: TreeData[];
  isFolder: boolean;
}

function toTreeData(nodes: FileNode[]): TreeData[] {
  return nodes.map((n) => ({
    id: n.path,
    name: n.name,
    isFolder: n.type === 'folder',
    children: n.children ? toTreeData(n.children) : undefined,
  }));
}

// ─────────────────────────────────────────────
// Tree Node renderer
// ─────────────────────────────────────────────

function Node({ node, style, dragHandle }: NodeRendererProps<TreeData>) {
  const activeFilePath = useIdeStore((s) => s.activeFilePath);
  const isActive = !node.data.isFolder && node.data.id === activeFilePath;

  const iconClass = node.data.isFolder
    ? node.isOpen
      ? 'codicon-folder-opened'
      : 'codicon-folder'
    : getFileIcon(node.data.name);

  const iconColor = node.data.isFolder
    ? '#dcb67a'
    : iconClass === 'codicon-file-code'
      ? '#519aba'
      : '#969696';

  return (
    <div
      ref={dragHandle}
      style={style}
      className={`flex items-center gap-1 px-2 text-[13px] cursor-pointer h-[22px]
        hover:bg-[#2a2d2e] transition-colors duration-75
        ${isActive ? 'bg-[#37373d] text-white' : 'text-[#cccccc]'}
      `}
      onClick={() => {
        if (node.data.isFolder) {
          node.toggle();
        } else {
          useIdeStore.getState().openFile(node.data.id);
        }
      }}
    >
      {node.data.isFolder && (
        <i
          className={`codicon ${node.isOpen ? 'codicon-chevron-down' : 'codicon-chevron-right'}`}
          style={{ fontSize: 12, color: '#858585', flexShrink: 0 }}
        />
      )}
      {!node.data.isFolder && <span style={{ width: 12, flexShrink: 0 }} />}
      <i
        className={`codicon ${iconClass} file-tree-icon`}
        style={{ color: iconColor }}
      />
      <span className="truncate">{node.data.name}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// FileTree component
// ─────────────────────────────────────────────

interface FileTreeProps {
  containerId: string;
}

export function FileTree({ containerId }: FileTreeProps) {
  const [treeData, setTreeData] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTree = useCallback(async () => {
    if (!containerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFileTree(containerId);
      if (!data || !Array.isArray(data)) {
        setTreeData([]);
      } else {
        setTreeData(toTreeData(data));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file tree');
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  }, [containerId]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] select-none">
      {/* Header */}
      <div className="sidebar-header">
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
      <div className="flex-1 overflow-hidden">
        {loading && treeData.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gray-500" />
          </div>
        )}

        {error && (
          <div className="px-3 py-4 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        {!loading && !error && treeData.length === 0 && (
          <div className="px-3 py-4 text-xs text-gray-500 text-center">
            No files found
          </div>
        )}

        {treeData.length > 0 && (
          <Tree<TreeData>
            data={treeData}
            openByDefault={false}
            rowHeight={22}
            indent={16}
            padding={4}
            width="100%"
            disableDrag
            disableDrop
          >
            {Node}
          </Tree>
        )}
      </div>
    </div>
  );
}
