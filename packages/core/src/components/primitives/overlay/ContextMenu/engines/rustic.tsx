'use client';

/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the ContextMenu overlay component.
 * Renders a portal-based floating menu at the cursor position on right-click,
 * styled via token-backed CSS properties and design-system variables.
 *
 * @example
 * ```tsx
 * <RusticContextMenu
 *   items={[{ key: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' }]}
 *   trigger={<div>Right-click target</div>}
 *   onSelect={(key) => console.log(key)}
 * />
 * ```
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ContextMenuProps, ContextMenuItem } from '../ContextMenu.types';

/**
 * Renders a single menu row -- standard item, divider, or group header.
 * Hover effects are applied via inline style mutations because the rustic
 * engine avoids external CSS. The translateX micro-interaction provides
 * visual feedback that the item is interactive.
 */
const MenuItem: React.FC<{
  item: ContextMenuItem;
  onClick?: (key: string) => void;
}> = ({ item, onClick }) => {
  if (item.type === 'divider') {
    return (
      <div
        role="separator"
        data-part="divider"
        style={{
          height: 1,
          margin: '6px 0',
        }}
      />
    );
  }

  if (item.type === 'group') {
    return (
      <div
        data-part="group-label"
        style={{
          padding: '6px 12px 4px',
          fontSize: 12,
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
      data-part="item"
      data-tone={item.danger ? 'danger' : undefined}
      data-disabled={item.disabled ? 'true' : undefined}
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
        cursor: item.disabled ? 'not-allowed' : 'pointer',
        opacity: item.disabled ? 0.5 : 1,
        textAlign: 'left',
        fontSize: 14,
        lineHeight: 1.5,
        fontFamily: 'inherit',
        transition: 'background-color var(--ds-personality-animation-entrance-duration, 180ms) var(--ds-input-transition-timing, ease), color var(--ds-personality-animation-entrance-duration, 180ms) var(--ds-input-transition-timing, ease), transform var(--ds-personality-animation-entrance-duration, 180ms) var(--ds-input-transition-timing, ease)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {item.icon}
        {item.label}
      </span>
      {item.shortcut && (
        <span data-part="shortcut" style={{ fontSize: 12 }}>
          {item.shortcut}
        </span>
      )}
    </button>
  );
};

/**
 * ContextMenu implementation using pure inline CSS and a React portal.
 *
 * The menu is portalled to `document.body` so it is not constrained by any
 * ancestor's `overflow` or `z-index` stacking context. Position is calculated
 * from the cursor's viewport coordinates plus scroll offsets for accuracy in
 * scrollable pages. Both click-outside and Escape-key dismissal are supported.
 *
 * @param props - {@link ContextMenuProps} shared across all engines.
 * @returns The trigger element plus a portal-rendered floating menu.
 */
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

  // Use absolute page coordinates (clientXY + scroll) so the portal menu
  // appears exactly at the cursor regardless of scroll position
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

  // Two dismissal vectors: clicking outside the menu, or pressing Escape
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

  // Portal the menu to document.body to escape overflow/z-index constraints
  const menuContent = isOpen && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          data-part="surface"
          data-open="true"
          className={`rottay-context-menu--rustic ${overlayClassName || ''}`}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 1060,
            minWidth: 180,
            padding: '6px',
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
        data-part="trigger"
        data-open={isOpen ? 'true' : 'false'}
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
