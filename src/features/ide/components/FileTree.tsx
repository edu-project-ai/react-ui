import React from 'react';
import { Tree } from 'react-arborist';
import type { NodeRendererProps } from 'react-arborist';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useIdeStore } from '../store/useIdeStore';
import { useFileTree } from '../hooks/useFileTree';
import { ContextMenu } from './ContextMenu';
import { getFileIcon } from '../utils/fileTreeUtils';
import type { TreeData, MenuItem } from '../types';
import '../styles/ide.css';

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
      onContextMenu={(e: React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent('filetree-contextmenu', {
            detail: {
              x: e.clientX,
              y: e.clientY,
              node: node.data,
            },
          }),
        );
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

interface FileTreeProps {
  containerId: string;
}

export function FileTree({ containerId }: FileTreeProps) {
  const { treeData, loading, error, contextMenu, loadTree, closeContextMenu } =
    useFileTree(containerId);

  const getNodeMenuItems = (node: TreeData): MenuItem[] => [
    {
      label: 'Copy Path',
      icon: 'codicon-copy',
      onClick: () => {
        navigator.clipboard.writeText(node.id);
      },
    },
  ];

  return (
    <>
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

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getNodeMenuItems(contextMenu.node)}
          onClose={closeContextMenu}
        />
      )}
    </>
  );
}
