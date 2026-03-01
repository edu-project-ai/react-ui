import { useCallback } from 'react';
import { useIdeStore } from '../store/useIdeStore';
import { useTabContextMenu } from '../hooks/useTabContextMenu';
import { ContextMenu } from './ContextMenu';
import { getFileName } from '../utils/pathUtils';
import '../styles/ide.css';

export function EditorTabs() {
  const tabs = useIdeStore((s) => s.tabs);
  const activeFilePath = useIdeStore((s) => s.activeFilePath);
  const setActiveFile = useIdeStore((s) => s.setActiveFile);
  const closeTab = useIdeStore((s) => s.closeTab);

  const { contextMenu, handleContextMenu, getMenuItems, closeContextMenu } =
    useTabContextMenu();

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
          items={getMenuItems(contextMenu.tab)}
          onClose={closeContextMenu}
        />
      )}
    </>
  );
}
