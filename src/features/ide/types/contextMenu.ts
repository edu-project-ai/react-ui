export interface MenuItem {
  label: string;
  icon?: string; // codicon class
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean; // show divider after this item
}

export interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}
