import { useRef } from 'react';
import { useIdeStore } from '../store/useIdeStore';
import { useExportWorkspace } from '../hooks/useExportWorkspace';
import { useImportWorkspace } from '../hooks/useImportWorkspace';
import '../styles/ide.css';

export function ActivityBar() {
  const sidebarVisible = useIdeStore((s) => s.sidebarVisible);
  const activeSidebarPanel = useIdeStore((s) => s.activeSidebarPanel);
  const toggleSidebar = useIdeStore((s) => s.toggleSidebar);
  const setActiveSidebarPanel = useIdeStore((s) => s.setActiveSidebarPanel);
  
  const browserVisible = useIdeStore((s) => s.browserVisible);
  const toggleBrowser = useIdeStore((s) => s.toggleBrowser);

  const containerId = useIdeStore((s) => s.containerId);
  const { exportWorkspace, isExporting } = useExportWorkspace(containerId);
  const { importWorkspace, isImporting } = useImportWorkspace(containerId);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected
    e.target.value = '';
    await importWorkspace(file);
  };

  const handlePanelClick = (panel: 'explorer' | 'search') => {
    if (activeSidebarPanel === panel) {
      toggleSidebar(); // toggle visibility
    } else {
      setActiveSidebarPanel(panel);
      if (!sidebarVisible) toggleSidebar(); // show if hidden
    }
  };

  return (
    <div className="activity-bar flex flex-col justify-between">
      <div>
        <button
          type="button"
          className={`activity-bar-button ${activeSidebarPanel === 'explorer' && sidebarVisible ? 'active' : ''}`}
          onClick={() => handlePanelClick('explorer')}
          title="Explorer (Ctrl+Shift+E)"
        >
          <i className="codicon codicon-files" style={{ fontSize: 24 }} />
        </button>

        <button
          type="button"
          className={`activity-bar-button ${activeSidebarPanel === 'search' && sidebarVisible ? 'active' : ''}`}
          onClick={() => handlePanelClick('search')}
          title="Search (Ctrl+Shift+F)"
        >
          <i className="codicon codicon-search" style={{ fontSize: 24 }} />
        </button>
      </div>

      <div>
        <button
          type="button"
          className={`activity-bar-button ${browserVisible ? 'active' : ''}`}
          onClick={toggleBrowser}
          title="Browser Preview"
        >
          <i className="codicon codicon-globe" style={{ fontSize: 24 }} />
        </button>

        <button
          type="button"
          className="activity-bar-button"
          onClick={exportWorkspace}
          disabled={!containerId || isExporting}
          title="Export workspace as .tar"
        >
          {isExporting ? (
            <i className="codicon codicon-loading codicon-modifier-spin" style={{ fontSize: 24 }} />
          ) : (
            <i className="codicon codicon-cloud-download" style={{ fontSize: 24 }} />
          )}
        </button>

        <button
          type="button"
          className="activity-bar-button"
          onClick={() => importInputRef.current?.click()}
          disabled={!containerId || isImporting}
          title="Import workspace from .tar"
        >
          {isImporting ? (
            <i className="codicon codicon-loading codicon-modifier-spin" style={{ fontSize: 24 }} />
          ) : (
            <i className="codicon codicon-cloud-upload" style={{ fontSize: 24 }} />
          )}
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".tar"
          style={{ display: 'none' }}
          onChange={handleImportChange}
        />
      </div>
    </div>
  );
}
