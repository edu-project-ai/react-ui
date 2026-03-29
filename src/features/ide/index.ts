// Main exports for the IDE feature
export { Terminal } from './components/terminal/Terminal';
export { IdePage } from './pages/IdePage';

// Types
export type { ConsoleMessage, TerminalSize, SessionInfo, TerminalStatus } from './types/terminal';
export type { Tab, CursorPosition } from './types/editor';
export type { MenuItem, ContextMenuProps } from './types/contextMenu';
export type { FileNode, TreeData } from './types/fileTree';
export type { SearchResult, GroupedSearchResults } from './types/search';
