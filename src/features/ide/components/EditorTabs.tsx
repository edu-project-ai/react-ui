import { useCallback, useState } from 'react';
import type { Tab } from '../store/types';
import { useIdeStore } from '../store/useIdeStore';
import { ContextMenu, type MenuItem } from './ContextMenu';
import '../styles/ide.css';

function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

export function EditorTabs() {
  const tabs = useIdeStore((s) => s.tabs);
  const activeFilePath = useIdeStore((s) => s.activeFilePath);
  const setActiveFile = useIdeStore((s) => s.setActiveFile);
  const closeTab = useIdeStore((s) => s.closeTab);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tab: Tab;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, path: string) => {
      // Middle click closes tab
      if (e.button === 1) {
        e.preventDefault();
        closeTab(path);
      }
    },
    [closeTab],
  );

  const handleContextMenu = (e: React.MouseEvent, tab: Tab) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tab,
    });
  };

  const getTabMenuItems = (tab: Tab): MenuItem[] => {
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
          tabs.filter((t) => t.path !== tab.path).forEach((t) => closeTab(t.path));
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
  };

  if (tabs.length === 0) return null;

  return (
    <>
      <div className="editor-tabs">
        {tabs.map((tab) => {
          const isActive = tab.path === activeFilePath;
          return (
            <button
              key={tab.path}
              type="button"
              className={`editor-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveFile(tab.path)}
              onMouseDown={(e) => handleMouseDown(e, tab.path)}
              onContextMenu={(e) => handleContextMenu(e, tab)}
            >
              <span>{getFileName(tab.path)}</span>
              {tab.isDirty && <span className="dirty-dot" />}
              <span
                className="close-btn"
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.path);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    closeTab(tab.path);
                  }
                }}
              >
                <i className="codicon codicon-close" style={{ fontSize: 14 }} />
              </span>
            </button>
          );
        })}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getTabMenuItems(contextMenu.tab)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
