'use client';

/**
 * @fileoverview Rustic engine for the ContextMenu overlay component. The menu
 * is positioned by the shared overlay positioning runtime
 * (`runtime/overlay/positioning`): a right-click captures the cursor's viewport
 * point, a ZERO-SIZE anchor is rendered there, and `useOverlayPosition` pins
 * the panel to it with `bottom-start` placement and a zero offset so the
 * panel's top-left corner lands on the cursor.
 *
 * The panel's standalone `.rottay-context-menu--rustic` scope class carries
 * every skin rule, so either render path styles identically: the `js` strategy
 * renders the panel through the shared overlay portal (escaping ancestor
 * `overflow`/`z-index`), while the `anchor-css` strategy promotes it to the top
 * layer via the popover API and renders it inline. `data-ds-position-strategy`
 * is stamped for e2e/debug observability. Both click-outside and Escape-key
 * dismissal are supported.
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
import type { ContextMenuProps, ContextMenuItem } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import {
  OverlayPortalBoundary,
  useOverlayPosition,
} from '../../../../runtime/overlay/positioning';

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
 * ContextMenu implementation for the rustic engine.
 *
 * The menu is positioned by the shared overlay runtime against a zero-size
 * pointer anchor and rendered through the shared overlay portal (js strategy)
 * or inline in the top layer (anchor-css strategy). Both click-outside and
 * Escape-key dismissal are supported.
 *
 * @param props - {@link ContextMenuProps} shared across all engines.
 * @returns The trigger element plus the shared-positioned floating menu.
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
  // Cursor's viewport point; the zero-size anchor is pinned here with
  // position: fixed, so these are viewport coordinates (clientX/clientY).
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // The panel is both the click-outside target and the positioned overlay.
  const setMenuRef = useCallback((node: HTMLDivElement | null) => {
    menuRef.current = node;
    setMenuEl(node);
  }, []);

  const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
    anchor: anchorEl,
    overlay: menuEl,
    placement: 'bottom-start',
    offset: 0,
    flip: true,
  });

  // The cursor's viewport point is where the zero-size anchor is pinned
  // (position: fixed); the shared positioning runtime owns the geometry.
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setPoint({ x: e.clientX, y: e.clientY });
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

  const surfaceStyle: React.CSSProperties = {
    zIndex: 1060,
    minWidth: 180,
    padding: '6px',
    fontFamily: 'var(--ds-font-family-base, inherit)',
    // Positioning from the shared runtime; consumer overlayStyle spreads last
    // and wins.
    ...positionStyle,
    ...overlayStyle,
  };

  const menuNode = (
    <div
      ref={setMenuRef}
      role="menu"
      data-part="surface"
      data-open="true"
      data-ds-position-strategy={strategy}
      className={`rottay-context-menu--rustic ${overlayClassName || ''}`}
      style={surfaceStyle}
    >
      {items.map((item) => (
        <MenuItem key={item.key} item={item} onClick={handleItemClick} />
      ))}
    </div>
  );

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
      {isOpen && (
        <>
          <div
            ref={setAnchorEl}
            data-part="pointer-anchor"
            aria-hidden="true"
            style={{ position: 'fixed', left: point.x, top: point.y, width: 0, height: 0, pointerEvents: 'none' }}
            {...anchorAttrs}
          />
          {strategy === 'anchor-css' ? (
            menuNode
          ) : (
            <Portal>
              <OverlayPortalBoundary>{menuNode}</OverlayPortalBoundary>
            </Portal>
          )}
        </>
      )}
    </>
  );
}

RusticContextMenu.displayName = 'ContextMenu.Rustic';
