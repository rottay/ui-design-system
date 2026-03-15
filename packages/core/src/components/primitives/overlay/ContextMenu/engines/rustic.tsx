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
import type { ContextMenuProps, ContextMenuItem } from '../ContextMenu.types';

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
          backgroundColor: 'var(--ds-dropdown-divider-color, var(--ds-color-neutral-200, #e5e7eb))',
          margin: '6px 0',
        }}
      />
    );
  }

  if (item.type === 'group') {
    return (
      <div
        style={{
          padding: '6px 12px 4px',
          fontSize: 12,
          color: 'var(--ds-dropdown-group-color, var(--ds-color-text-secondary, #6b7280))',
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
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
        color: item.danger ? 'var(--ds-dropdown-danger-color, var(--ds-color-error-500, #ef4444))' : 'var(--ds-dropdown-item-color, inherit)',
        textAlign: 'left',
        fontSize: 14,
        lineHeight: 1.5,
        fontFamily: 'inherit',
        borderRadius: 'var(--ds-radius-sm, 6px)',
        transition: 'background-color var(--ds-personality-animation-entrance-duration, 180ms) var(--ds-input-transition-timing, ease), color var(--ds-personality-animation-entrance-duration, 180ms) var(--ds-input-transition-timing, ease), transform var(--ds-personality-animation-entrance-duration, 180ms) var(--ds-input-transition-timing, ease)',
      }}
      onMouseEnter={(e) => {
        if (!item.disabled) {
          e.currentTarget.style.backgroundColor = 'var(--ds-dropdown-item-hover-bg, var(--ds-color-neutral-100, #f3f4f6))';
          e.currentTarget.style.transform = 'translateX(2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {item.icon}
        {item.label}
      </span>
      {item.shortcut && (
        <span style={{ fontSize: 12, color: 'var(--ds-dropdown-shortcut-color, var(--ds-color-text-secondary, #6b7280))' }}>
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
            backgroundColor: 'var(--ds-dropdown-bg, var(--ds-color-bg-elevated, #fff))',
            borderRadius: 'var(--ds-dropdown-radius, var(--ds-radius-lg, 12px))',
            boxShadow: 'var(--ds-dropdown-shadow, var(--ds-shadow-lg))',
            padding: '6px',
            border: '1px solid var(--ds-dropdown-border-color, var(--ds-color-neutral-200, #e5e7eb))',
            fontFamily: 'var(--ds-font-family-base, inherit)',
            backdropFilter: 'var(--ds-modal-overlay-backdrop, blur(4px))',
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
