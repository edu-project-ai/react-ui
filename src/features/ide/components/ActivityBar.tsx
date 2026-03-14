import { useIdeStore } from '../store/useIdeStore';
import '../styles/ide.css';

export function ActivityBar() {
  const sidebarVisible = useIdeStore((s) => s.sidebarVisible);
  const activeSidebarPanel = useIdeStore((s) => s.activeSidebarPanel);
  const toggleSidebar = useIdeStore((s) => s.toggleSidebar);
  const setActiveSidebarPanel = useIdeStore((s) => s.setActiveSidebarPanel);
  
  const browserVisible = useIdeStore((s) => s.browserVisible);
  const toggleBrowser = useIdeStore((s) => s.toggleBrowser);

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
      </div>
    </div>
  );
}
