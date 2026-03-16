'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the ContextMenu overlay component.
 * Positions a DaisyUI-styled menu at the cursor location on right-click, with
 * click-outside dismissal and keyboard shortcut display support.
 *
 * @example
 * ```tsx
 * <ModernContextMenu
 *   items={[{ key: 'paste', label: 'Paste', shortcut: 'Ctrl+V' }]}
 *   trigger={<div className="p-8">Right-click area</div>}
 *   onSelect={(key) => console.log(key)}
 * />
 * ```
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ContextMenuProps, ContextMenuItem } from '../ContextMenu.types';

/** Renders a single menu row: standard item, divider, or group title. */
const MenuItem: React.FC<{
  item: ContextMenuItem;
  onClick?: (key: string) => void;
}> = ({ item, onClick }) => {
  if (item.type === 'divider') {
    return <li className="divider my-1" />;
  }

  if (item.type === 'group') {
    return (
      <li className="menu-title">
        <span>{item.label}</span>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className={`flex items-center justify-between gap-2 ${item.disabled ? 'disabled opacity-50' : ''} ${item.danger ? 'text-error' : ''}`}
        disabled={item.disabled}
        onClick={() => {
          item.onClick?.();
          onClick?.(item.key);
        }}
      >
        <span className="flex items-center gap-2">
          {item.icon}
          {item.label}
        </span>
        {item.shortcut && (
          <span className="text-xs opacity-50">{item.shortcut}</span>
        )}
      </button>
    </li>
  );
};

/**
 * ContextMenu implementation using DaisyUI menu classes and Tailwind utilities.
 *
 * The menu is positioned absolutely within the trigger container using the
 * cursor's offset from the container's bounding rect. A mousedown listener
 * on the document handles click-outside dismissal.
 *
 * @param props - {@link ContextMenuProps} shared across all engines.
 * @returns A relatively-positioned container that intercepts right-click.
 */
export default function ModernContextMenu(props: ContextMenuProps): React.ReactElement {
  const {
    items,
    onSelect,
    trigger,
    disabled = false,
    className,
    overlayClassName,
    overlayStyle,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Capture cursor position relative to the container so the menu appears at
  // the exact right-click location rather than at a fixed offset
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setIsOpen(true);
  }, [disabled]);

  // Close the menu and propagate the selected item key to the consumer
  const handleItemClick = useCallback((key: string) => {
    onSelect?.(key);
    setIsOpen(false);
  }, [onSelect]);

  // Dismiss the menu when clicking anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className || ''}`}
      onContextMenu={handleContextMenu}
    >
      {trigger}
      {isOpen && (
        <ul
          ref={menuRef}
          className={`menu bg-base-100 rounded-box absolute z-50 w-56 p-2 shadow-lg ${overlayClassName || ''}`}
          style={{
            left: position.x,
            top: position.y,
            ...overlayStyle,
          }}
        >
          {items.map((item) => (
            <MenuItem key={item.key} item={item} onClick={handleItemClick} />
          ))}
        </ul>
      )}
    </div>
  );
}

ModernContextMenu.displayName = 'ContextMenu.Modern';
