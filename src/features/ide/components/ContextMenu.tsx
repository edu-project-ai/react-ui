import React, { useRef, useState, useEffect } from 'react';

export interface MenuItem {
  label: string;
  icon?: string; // codicon class
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean; // show divider after this item
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  // Adjust position if menu goes off-screen
  useEffect(() => {
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const newPos = { x, y };

    // Check right edge
    if (x + rect.width > window.innerWidth) {
      newPos.x = window.innerWidth - rect.width - 8;
    }

    // Check bottom edge
    if (y + rect.height > window.innerHeight) {
      newPos.y = window.innerHeight - rect.height - 8;
    }

    setPosition(newPos);
  }, [x, y]);

  // Close on click outside or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <button
            type="button"
            className="context-menu-item"
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
          >
            {item.icon && <i className={`codicon ${item.icon}`} />}
            <span>{item.label}</span>
          </button>
          {item.divider && <div className="context-menu-divider" />}
        </React.Fragment>
      ))}
    </div>
  );
}
