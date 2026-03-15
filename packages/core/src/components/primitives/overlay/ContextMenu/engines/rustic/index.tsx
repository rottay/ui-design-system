'use client';

/**
 * @fileoverview ContextMenu Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the ContextMenu component.
 * Uses a portal menu with contextmenu event listener.
 *
 * @module ContextMenu/Engines/Rustic
 * @category Overlay
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ContextMenuProps, ContextMenuItem } from '../../types';

const MenuItem: React.FC<{
  item: ContextMenuItem;
  onClick?: (key: string) => void;
}> = ({ item, onClick }) => {
  if (item.type === 'divider') {
    return (
      <div
        role="separator"
        style={{
          height: 1,
          backgroundColor: 'var(--ds-color-neutral-200, #e5e7eb)',
          margin: '4px 0',
        }}
      />
    );
  }

  if (item.type === 'group') {
    return (
      <div
        style={{
          padding: '4px 12px',
          fontSize: 12,
          color: 'var(--ds-color-text-secondary, #6b7280)',
          fontWeight: 500,
        }}
      >
        {item.label}
      </div>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={() => {
        if (item.disabled) return;
        item.onClick?.();
        onClick?.(item.key);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '6px 12px',
        border: 'none',
        background: 'transparent',
        cursor: item.disabled ? 'not-allowed' : 'pointer',
        opacity: item.disabled ? 0.5 : 1,
        color: item.danger ? 'var(--ds-color-error-500, #ef4444)' : 'inherit',
        textAlign: 'left',
        fontSize: 14,
        lineHeight: 1.5,
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        if (!item.disabled) {
          e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-100, #f3f4f6)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {item.icon}
        {item.label}
      </span>
      {item.shortcut && (
        <span style={{ fontSize: 12, color: 'var(--ds-color-text-secondary, #999)' }}>
          {item.shortcut}
        </span>
      )}
    </button>
  );
};

export default function RusticContextMenu(props: ContextMenuProps): React.ReactElement {
  const {
    items,
    onSelect,
    trigger,
    disabled = false,
    className,
    style,
    overlayClassName,
    overlayStyle,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setPosition({
      top: e.clientY + window.scrollY,
      left: e.clientX + window.scrollX,
    });
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

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const menuContent = isOpen && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          className={overlayClassName}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 1060,
            minWidth: 180,
            backgroundColor: 'var(--ds-color-bg-elevated, #fff)',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
            padding: '4px 0',
            border: '1px solid var(--ds-color-neutral-200, #e5e7eb)',
            fontFamily: 'var(--ds-font-family-base, inherit)',
            ...overlayStyle,
          }}
        >
          {items.map((item) => (
            <MenuItem key={item.key} item={item} onClick={handleItemClick} />
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div
        ref={triggerRef}
        className={className}
        style={{ display: 'inline-block', ...style }}
        onContextMenu={handleContextMenu}
      >
        {trigger}
      </div>
      {menuContent}
    </>
  );
}

RusticContextMenu.displayName = 'ContextMenu.Rustic';
