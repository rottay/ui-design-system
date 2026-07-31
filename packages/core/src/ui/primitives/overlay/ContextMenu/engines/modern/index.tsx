'use client';

/**
 * @fileoverview Modern engine for the ContextMenu overlay component. The menu
 * is positioned by the shared overlay positioning runtime
 * (`runtime/overlay/positioning`): a right-click captures the cursor's viewport
 * point, a ZERO-SIZE anchor is rendered there, and `useOverlayPosition` pins
 * the panel to it with a zero offset so the panel's near corner lands on the
 * cursor. The runtime's `start`/`end` are physical, so the engine captures the
 * reading direction at open time and picks `bottom-start` (LTR: top-left
 * corner on the cursor) or `bottom-end` (RTL: top-right corner on the cursor)
 * -- the panel always opens toward the reading-start side, like a native
 * context menu.
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
  // All row geometry (divider thickness/margins, group-label chrome, item
  // layout) is skin-owned -- context-menu.css keys on data-part. No utility
  // classes and no static inline geometry on this tree. Menu semantics mirror
  // Dropdown's (role=menu/menuitem/separator), so assistive tech and the
  // shared overlay tests treat both widgets identically.
  if (item.type === 'divider') {
    return <li role="separator" data-part="divider" />;
  }

  if (item.type === 'group') {
    return (
      <li role="presentation" data-part="group-label">
        <span>{item.label}</span>
      </li>
    );
  }

  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        data-part="item"
        data-tone={item.danger ? 'danger' : undefined}
        data-disabled={item.disabled ? 'true' : undefined}
        aria-disabled={item.disabled || undefined}
        disabled={item.disabled}
        onClick={() => {
          item.onClick?.();
          onClick?.(item.key);
        }}
      >
        <span data-part="label">
          {item.icon}
          {item.label}
        </span>
        {item.shortcut && (
          <span data-part="shortcut">{item.shortcut}</span>
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
 * renders no DaisyUI component classes and no utility-framework classes --
 * its `<ul>` carries only the consumer's `overlayClassName` -- so the modern
 * skin owns every rule through the trigger scope class, including row
 * geometry drained from inline styles/utility classes in K4-A.
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
  // Viewport geometry is PHYSICAL by nature -- the anchor's `left: point.x`
  // is a measured coordinate, not a declared placement, so it stays physical
  // in both directions. The READING DIRECTION captured at open time drives
  // the logical panel alignment below instead.
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [menuEl, setMenuEl] = useState<HTMLUListElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
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
    // `start`/`end` in the shared runtime are PHYSICAL (bottom-start spans
    // right). The panel must open toward the reading-START side -- leftward
    // under RTL, like a native context menu -- so the physical placement is
    // chosen from the direction captured at open time.
    placement: direction === 'rtl' ? 'bottom-end' : 'bottom-start',
    offset: 0,
    flip: true,
  });

  // Every open path funnels here: pointer (contextmenu event) or keyboard
  // (Shift+F10 / the Menu key), so the direction capture stays single-source.
  const openMenu = useCallback((x: number, y: number, sourceEl: HTMLElement) => {
    setPoint({ x, y });
    setDirection(
      sourceEl.closest<HTMLElement>('[dir]')?.dir === 'rtl' ||
        window.getComputedStyle(sourceEl).direction === 'rtl'
        ? 'rtl'
        : 'ltr'
    );
    setIsOpen(true);
  }, []);

  // The cursor's viewport point is where the zero-size anchor is pinned; the
  // shared positioning runtime owns the resulting geometry.
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    openMenu(e.clientX, e.clientY, e.currentTarget as HTMLElement);
  }, [disabled, openMenu]);

  // Keyboard parity for the pointer's right-click: Shift+F10 or the Menu key
  // opens the menu centered on the focused trigger (the native posture).
  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      openMenu(rect.left + rect.width / 2, rect.top + rect.height / 2, e.currentTarget as HTMLElement);
    }
  }, [disabled, openMenu]);

  // Close the menu and propagate the selected item key to the consumer
  const handleItemClick = useCallback((key: string) => {
    onSelect?.(key);
    setIsOpen(false);
    triggerRef.current?.focus();
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

  // APG menu keyboard contract: on open the first enabled item takes focus;
  // arrows cycle (wrapping), Home/End jump to the edges, Escape closes and
  // returns focus to the context trigger. Typeahead is registered debt.
  useEffect(() => {
    if (isOpen) {
      menuRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')
        ?.focus();
    }
  }, [isOpen]);

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }
    const menuItems = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? []
    );
    if (menuItems.length === 0) return;
    const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number | undefined;
    if (e.key === 'ArrowDown') {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % menuItems.length;
    } else if (e.key === 'ArrowUp') {
      nextIndex = currentIndex < 0 ? menuItems.length - 1 : (currentIndex - 1 + menuItems.length) % menuItems.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = menuItems.length - 1;
    }
    if (nextIndex !== undefined) {
      e.preventDefault();
      menuItems[nextIndex]?.focus();
    }
  }, []);

  const surfaceStyle: React.CSSProperties = {
    // Tokenized overlay stack (spec section 9): context menus share the popover
    // tier (matches the canonical --ds-z-index-context-menu alias), not a magic
    // 50. The top layer ignores z-index; this only orders the js path.
    zIndex: 'var(--ds-z-popover)',
    animation: `${dataState === 'open' ? 'ds-context-menu-popover-enter-modern' : 'ds-context-menu-popover-exit-modern'} ${MOTION_DURATION} ${MOTION_EASING} both`,
    // Panel chrome (width, padding, list reset) is skin-owned. Positioning
    // comes from the shared runtime; consumer overlayStyle spreads last and
    // wins.
    ...positionStyle,
    ...overlayStyle,
  };

  return (
    <div
      ref={triggerRef}
      data-part="trigger"
      data-open={isOpen ? 'true' : 'false'}
      className={`rottay-context-menu--modern ${className || ''}`}
      onContextMenu={handleContextMenu}
      onKeyDown={handleTriggerKeyDown}
      tabIndex={disabled ? -1 : 0}
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
            role="menu"
            aria-orientation="vertical"
            data-part="surface"
            data-open={dataState === 'open' ? 'true' : 'false'}
            data-ds-position-strategy={strategy}
            className={overlayClassName || undefined}
            style={surfaceStyle}
            onKeyDown={handleMenuKeyDown}
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
