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
 * OPTION GRAMMAR (Dropdown's, composed -- not duplicated): rows are
 * `item-shell > item` with `icon`/`label`/`shortcut`/`submenu-indicator`
 * parts; `item.children` expands an INLINE (accordion) submenu, never a
 * fly-out, because the panel is a scroll container and would clip it. Every
 * menu level runs the same APG keyboard contract (arrows/Home/End/typeahead,
 * logical forward/backward submenu keys). Disclosure semantics are cloned
 * onto the consumer's trigger element (aria-haspopup/controls/expanded), and
 * an empty item list mounts no panel at all.
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

import React, { useState, useRef, useEffect, useCallback, useId, isValidElement, cloneElement } from 'react';
import type { ContextMenuProps, ContextMenuItem } from '../../contracts';
import { usePresence } from '@/graphics/motion/react/runtime';
import { useOverlayPosition } from '../../../../runtime/overlay/positioning';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

const MOTION_DURATION = 'var(--ds-motion-fast)';
const MOTION_EASING = 'var(--ds-motion-ease-out)';

/**
 * Typeahead state for the menu keyboard contract below (Dropdown's idiom,
 * shared verbatim): printable characters focus the next enabled item whose
 * visible text starts with the typed prefix (wrapping). The buffer lives per
 * menu LEVEL, keyed weakly by the <ul> element, so no two menu instances --
 * nor two levels of one menu -- ever share a prefix; it resets after a pause
 * and dies with its DOM node.
 */
const TYPEAHEAD_RESET_MS = 500;
const typeaheadStateByMenu = new WeakMap<
  HTMLElement,
  { buffer: string; lastKeyTime: number }
>();

function resolveTypeaheadPrefix(menu: HTMLElement, key: string): string {
  const now = Date.now();
  const state = typeaheadStateByMenu.get(menu) ?? { buffer: '', lastKeyTime: 0 };
  state.buffer = now - state.lastKeyTime > TYPEAHEAD_RESET_MS ? key : state.buffer + key;
  state.lastKeyTime = now;
  typeaheadStateByMenu.set(menu, state);
  return state.buffer.toLowerCase();
}

/**
 * APG menu keyboard contract for ONE menu level (Dropdown's handler, shared
 * so the root menu and every inline submenu navigate identically):
 * ArrowUp/ArrowDown cycle the enabled items of THIS <ul> (wrapping), Home/End
 * jump to the edges, and printable characters run typeahead over the visible
 * item text. Events bubbling out of a nested submenu are ignored by the
 * ancestor handler (the target's closest role="menu" is the nested list), so
 * each level navigates its own items. Escape is NOT handled here -- the root
 * menu owns it (close + focus return), and a parent item's own keydown closes
 * its submenu first.
 */
function handleMenuLevelKeyDown(event: React.KeyboardEvent<HTMLUListElement>): void {
  const { key } = event;
  const menu = event.currentTarget;
  const target = event.target as HTMLElement | null;
  if (!target || target.closest('[role="menu"]') !== menu) return;
  const menuItems = Array.from(
    menu.querySelectorAll<HTMLElement>(
      ':scope > [data-part="item-shell"] > [data-part="item"]:not(:disabled)',
    ),
  );
  if (menuItems.length === 0) return;

  if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
    event.preventDefault();
    const currentIndex = menuItems.indexOf(target.closest('[data-part="item"]') as HTMLElement);
    let nextIndex = 0;
    if (key === 'Home') nextIndex = 0;
    else if (key === 'End') nextIndex = menuItems.length - 1;
    else if (currentIndex >= 0) {
      nextIndex = (currentIndex + (key === 'ArrowDown' ? 1 : -1) + menuItems.length) % menuItems.length;
    }
    menuItems[nextIndex]?.focus();
    return;
  }

  // Typeahead: single printable characters, never a chord and never Space
  // (Space stays the native button activation). The search starts AFTER the
  // current item and wraps, so repeating a key cycles its matches.
  if (key.length === 1 && key !== ' ' && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const prefix = resolveTypeaheadPrefix(menu, key);
    const currentIndex = menuItems.indexOf(target.closest('[data-part="item"]') as HTMLElement);
    for (let step = 1; step <= menuItems.length; step += 1) {
      const candidate = menuItems[(currentIndex + step) % menuItems.length];
      if (candidate?.textContent?.trim().toLowerCase().startsWith(prefix)) {
        event.preventDefault();
        candidate.focus();
        return;
      }
    }
  }
}

/** Renders a single menu row: standard item, divider, group title, or a
 *  parent item with an inline-expanding submenu (Dropdown's grammar). */
const MenuItem: React.FC<{
  item: ContextMenuItem;
  onClick?: (key: string) => void;
}> = ({ item, onClick }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);

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

  // Submenus expand INLINE (accordion), never as a fly-out: the panel is a
  // scroll container (overflow-block: auto), so a fly-out would be clipped by
  // its own surface. Nested levels reuse this same row renderer, so divider/
  // group/danger/disabled grammar composes at every depth.
  const hasChildren = Boolean(item.children?.length);

  const activate = () => {
    if (hasChildren) {
      setSubmenuOpen((current) => !current);
      return;
    }
    item.onClick?.();
    onClick?.(item.key);
  };

  return (
    <li
      role="none"
      data-part="item-shell"
      data-has-children={hasChildren ? 'true' : undefined}
      data-submenu-open={submenuOpen ? 'true' : undefined}
      onMouseEnter={() => hasChildren && setSubmenuOpen(true)}
      onMouseLeave={() => hasChildren && setSubmenuOpen(false)}
    >
      <button
        type="button"
        role="menuitem"
        data-part="item"
        data-tone={item.danger ? 'danger' : undefined}
        data-disabled={item.disabled ? 'true' : undefined}
        aria-disabled={item.disabled || undefined}
        aria-haspopup={hasChildren ? 'menu' : undefined}
        aria-expanded={hasChildren ? submenuOpen : undefined}
        disabled={item.disabled}
        onClick={activate}
        onKeyDown={(event) => {
          // Submenu keys are LOGICAL: forward opens, backward closes. Forward
          // is ArrowRight in LTR and ArrowLeft in RTL (Dropdown/Tabs
          // precedent), resolved from the item's context -- nearest `[dir]`
          // owner first, computed style as a fallback.
          const isRtl =
            event.currentTarget.closest<HTMLElement>('[dir]')?.dir === 'rtl' ||
            window.getComputedStyle(event.currentTarget).direction === 'rtl';
          const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
          const backwardKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
          if (event.key === forwardKey && hasChildren) {
            event.preventDefault();
            setSubmenuOpen(true);
          }
          if (event.key === backwardKey && hasChildren) {
            event.preventDefault();
            setSubmenuOpen(false);
          }
          if (event.key === 'Escape' && hasChildren && submenuOpen) {
            event.stopPropagation();
            setSubmenuOpen(false);
          }
        }}
      >
        {item.icon ? <span data-part="icon">{item.icon}</span> : null}
        <span data-part="label">{item.label}</span>
        {item.shortcut && (
          <span data-part="shortcut">{item.shortcut}</span>
        )}
        {hasChildren ? (
          <span data-part="submenu-indicator" aria-hidden="true">
            <NavigationForwardIcon decorative size={12} />
          </span>
        ) : null}
      </button>

      {hasChildren && submenuOpen ? (
        <ul role="menu" data-part="submenu" aria-orientation="vertical" onKeyDown={handleMenuLevelKeyDown}>
          {item.children?.map((child) => (
            <MenuItem key={child.key} item={child} onClick={onClick} />
          ))}
        </ul>
      ) : null}
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
  // An empty item list never renders a panel (Dropdown's `isOpen && hasItems`
  // posture): right-clicking still suppresses the native menu, but no blank
  // surface mounts.
  const hasItems = items.length > 0;
  const { shouldRender, dataState, ref: presenceRef } = usePresence(isOpen && hasItems);

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

  // APG menu keyboard contract: on open the first enabled item takes focus.
  // Arrows/Home/End/typeahead live in the shared level handler below; Escape
  // closes and returns focus to the context trigger.
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
    handleMenuLevelKeyDown(e);
  }, []);

  // Disclosure semantics live on the consumer's trigger ELEMENT (Dropdown's
  // describeTrigger precedent): this role-less wrapper may not carry
  // aria-haspopup/aria-expanded (axe aria-allowed-attr). Non-element triggers
  // (text, fragments) receive nothing -- there is no valid host for them.
  const surfaceId = useId();
  const describedTrigger =
    isValidElement(trigger) && trigger.type !== React.Fragment
      ? cloneElement(
          trigger as React.ReactElement<{
            'aria-controls'?: string;
            'aria-expanded'?: boolean;
            'aria-haspopup'?: 'menu';
          }>,
          {
            'aria-controls': surfaceId,
            'aria-expanded': isOpen,
            'aria-haspopup': 'menu',
          },
        )
      : trigger;

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
      {describedTrigger}
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
            id={surfaceId}
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
