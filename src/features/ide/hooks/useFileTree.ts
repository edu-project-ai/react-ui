import { useCallback, useEffect, useState } from 'react';
import type { TreeData } from '../types';
import { useLazyFetchFileTreeQuery } from '../api/ideProxyApi';
import { sortFileTreeNodes, toTreeData } from '../utils/fileTreeUtils';

interface FileTreeContextMenu {
  x: number;
  y: number;
  node: TreeData;
}

interface UseFileTreeReturn {
  treeData: TreeData[];
  loading: boolean;
  error: string | null;
  contextMenu: FileTreeContextMenu | null;
  loadTree: () => Promise<void>;
  closeContextMenu: () => void;
}

export function useFileTree(containerId: string): UseFileTreeReturn {
  const [treeData, setTreeData] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<FileTreeContextMenu | null>(
    null,
  );

  const [triggerFetchFileTree] = useLazyFetchFileTreeQuery();

  const loadTree = useCallback(async () => {
    if (!containerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await triggerFetchFileTree(containerId).unwrap();
      if (!data || !Array.isArray(data)) {
        setTreeData([]);
      } else {
        const sortedData = sortFileTreeNodes(data);
        setTreeData(toTreeData(sortedData));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file tree');
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  }, [containerId, triggerFetchFileTree]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Listen for context menu events dispatched from Node component
  useEffect(() => {
    const handleContextMenu = (e: Event) => {
      const event = e as CustomEvent<FileTreeContextMenu>;
      setContextMenu(event.detail);
    };

    window.addEventListener('filetree-contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('filetree-contextmenu', handleContextMenu);
    };
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  return { treeData, loading, error, contextMenu, loadTree, closeContextMenu };
}
