import { useCallback, useState } from 'react';
import type { Tab, MenuItem } from '../types';
import { useIdeStore } from '../store/useIdeStore';

interface TabContextMenu {
  x: number;
  y: number;
  tab: Tab;
}

interface UseTabContextMenuReturn {
  contextMenu: TabContextMenu | null;
  handleContextMenu: (e: React.MouseEvent, tab: Tab) => void;
  getMenuItems: (tab: Tab) => MenuItem[];
  closeContextMenu: () => void;
}

export function useTabContextMenu(): UseTabContextMenuReturn {
  const tabs = useIdeStore((s) => s.tabs);
  const closeTab = useIdeStore((s) => s.closeTab);

  const [contextMenu, setContextMenu] = useState<TabContextMenu | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, tab: Tab) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tab });
  }, []);

  const getMenuItems = useCallback(
    (tab: Tab): MenuItem[] => {
      const tabIndex = tabs.findIndex((t) => t.path === tab.path);

      return [
        {
          label: 'Close',
          icon: 'codicon-close',
          onClick: () => closeTab(tab.path),
        },
        {
          label: 'Close Others',
          icon: 'codicon-close-all',
          onClick: () => {
            tabs
              .filter((t) => t.path !== tab.path)
              .forEach((t) => closeTab(t.path));
          },
          disabled: tabs.length === 1,
        },
        {
          label: 'Close to the Right',
          icon: 'codicon-arrow-right',
          onClick: () => {
            tabs.slice(tabIndex + 1).forEach((t) => closeTab(t.path));
          },
          disabled: tabIndex === tabs.length - 1,
        },
        {
          label: 'Close All',
          icon: 'codicon-close-all',
          onClick: () => {
            tabs.forEach((t) => closeTab(t.path));
          },
          divider: true,
        },
        {
          label: 'Copy Path',
          icon: 'codicon-copy',
          onClick: () => {
            navigator.clipboard.writeText(tab.path);
          },
        },
      ];
    },
    [tabs, closeTab],
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  return { contextMenu, handleContextMenu, getMenuItems, closeContextMenu };
}
