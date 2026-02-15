import { useIdeStore } from '../store/useIdeStore';
import '../styles/ide.css';

export function ActivityBar() {
  const sidebarVisible = useIdeStore((s) => s.sidebarVisible);
  const toggleSidebar = useIdeStore((s) => s.toggleSidebar);

  return (
    <div className="activity-bar">
      <button
        type="button"
        className={`activity-bar-button ${sidebarVisible ? 'active' : ''}`}
        onClick={toggleSidebar}
        title="Explorer (Ctrl+B)"
      >
        <i className="codicon codicon-files" style={{ fontSize: 24 }} />
      </button>

      <button
        type="button"
        className="activity-bar-button"
        title="Search (coming soon)"
        disabled
        style={{ opacity: 0.4 }}
      >
        <i className="codicon codicon-search" style={{ fontSize: 24 }} />
      </button>
    </div>
  );
}
