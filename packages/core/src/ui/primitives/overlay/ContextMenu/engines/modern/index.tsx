'use client';

/**
 * @fileoverview Modern engine for the ContextMenu overlay component. The menu
 * is positioned by the shared overlay positioning runtime
 * (`runtime/overlay/positioning`): a right-click captures the cursor's viewport
 * point, a ZERO-SIZE anchor is rendered there, and `useOverlayPosition` pins
 * the panel to it with `bottom-start` placement and a zero offset so the
 * panel's top-left corner lands on the cursor.
 *
 * The panel renders INLINE as a direct child of the trigger container in BOTH
 * strategies: the modern skin scopes every rule under
 * `.rottay-context-menu--modern[data-part='trigger'] > [data-part='surface']`,
 * so the panel must stay that descendant. The `anchor-css` strategy promotes it
 * to the top layer via the popover API -- which leaves its DOM position
 * unchanged, so the skin still matches -- while the `js` strategy pins it with a
 * measured `position: fixed`. `data-ds-position-strategy` is stamped for
 * e2e/debug observability.
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
import type { ContextMenuProps, ContextMenuItem } from '../../contracts';
import { usePresence } from '@/graphics/motion/react/runtime';
import { useOverlayPosition } from '../../../../runtime/overlay/positioning';

const MOTION_DURATION = 'var(--ds-motion-fast)';
const MOTION_EASING = 'var(--ds-motion-ease-out)';

/** Renders a single menu row: standard item, divider, or group title. */
const MenuItem: React.FC<{
  item: ContextMenuItem;
  onClick?: (key: string) => void;
}> = ({ item, onClick }) => {
  if (item.type === 'divider') {
    return <li data-part="divider" style={{ height: 1, margin: '4px 0' }} />;
  }

  if (item.type === 'group') {
    return (
      <li data-part="group-label" style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
        <span>{item.label}</span>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        data-part="item"
        data-tone={item.danger ? 'danger' : undefined}
        data-disabled={item.disabled ? 'true' : undefined}
        className={`flex items-center justify-between gap-2 ${item.disabled ? 'disabled opacity-50' : ''}`}
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
 * ContextMenu implementation for the modern engine.
 *
 * The panel opens at the right-click point via the shared overlay positioning
 * runtime (zero-size pointer anchor) and dismisses on outside mousedown. It
 * renders no DaisyUI component classes -- its `<ul>` carries only the
 * consumer's `overlayClassName` -- so the modern skin owns every rule through
 * the trigger scope class.
 *
 * @param props - {@link ContextMenuProps} shared across all engines.
 * @returns The trigger container that intercepts right-click plus the inline,
 *   shared-positioned menu panel.
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
  // Cursor's viewport point; the zero-size anchor is pinned here with
  // position: fixed, so these are viewport coordinates (clientX/clientY).
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [menuEl, setMenuEl] = useState<HTMLUListElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const { shouldRender, dataState, ref: presenceRef } = usePresence(isOpen);

  // The <ul> is BOTH the presence-animated node and the positioned overlay, so
  // its ref fans out to presence (exit animation), click-outside, and the
  // shared positioning hook.
  const setMenuRef = useCallback((node: HTMLUListElement | null) => {
    menuRef.current = node;
    presenceRef(node);
    setMenuEl(node);
  }, [presenceRef]);

  const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
    anchor: anchorEl,
    overlay: menuEl,
    placement: 'bottom-start',
    offset: 0,
    flip: true,
  });

  // The cursor's viewport point is where the zero-size anchor is pinned; the
  // shared positioning runtime owns the resulting geometry.
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setPoint({ x: e.clientX, y: e.clientY });
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

  const surfaceStyle: React.CSSProperties = {
    // Tokenized overlay stack (spec section 9): context menus share the popover
    // tier (matches the canonical --ds-z-index-context-menu alias), not a magic
    // 50. The top layer ignores z-index; this only orders the js path.
    zIndex: 'var(--ds-z-popover)',
    width: 224,
    padding: 8,
    listStyle: 'none',
    margin: 0,
    animation: `${dataState === 'open' ? 'ds-context-menu-popover-enter-modern' : 'ds-context-menu-popover-exit-modern'} ${MOTION_DURATION} ${MOTION_EASING} both`,
    // Positioning from the shared runtime; consumer overlayStyle spreads last
    // and wins.
    ...positionStyle,
    ...overlayStyle,
  };

  return (
    <div
      data-part="trigger"
      data-open={isOpen ? 'true' : 'false'}
      className={`relative rottay-context-menu--modern ${className || ''}`}
      onContextMenu={handleContextMenu}
    >
      {trigger}
      {shouldRender && (
        <>
          <div
            ref={setAnchorEl}
            data-part="pointer-anchor"
            aria-hidden="true"
            style={{ position: 'fixed', left: point.x, top: point.y, width: 0, height: 0, pointerEvents: 'none' }}
            {...anchorAttrs}
          />
          <ul
            ref={setMenuRef}
            data-part="surface"
            data-open={dataState === 'open' ? 'true' : 'false'}
            data-ds-position-strategy={strategy}
            className={overlayClassName || undefined}
            style={surfaceStyle}
          >
            {items.map((item) => (
              <MenuItem key={item.key} item={item} onClick={handleItemClick} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

ModernContextMenu.displayName = 'ContextMenu.Modern';
