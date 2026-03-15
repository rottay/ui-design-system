'use client';

/**
 * @fileoverview ContextMenu Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the ContextMenu component.
 * Uses DaisyUI dropdown with a right-click handler.
 *
 * @module ContextMenu/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ContextMenuProps, ContextMenuItem } from '../../types';

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

  const handleItemClick = useCallback((key: string) => {
    onSelect?.(key);
    setIsOpen(false);
  }, [onSelect]);

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
