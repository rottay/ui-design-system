/**
 * @fileoverview Menu Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Menu component.
 * Part of the Rottay Design System's multi-engine architecture.
 *
 * @remarks
 * The engine stamps anatomy (`data-part` hooks), hierarchy (`data-level` +
 * the `--rottay-menu-level`/`--rottay-menu-inline-indent` custom-property
 * data channel — configuration, not paint) and interaction state
 * (`data-selected`, `data-open`, `data-disabled`, `data-tone`); the modern
 * skin (`modern/skin/menu.css`) owns 100% of layout and paint. No inline
 * style objects beyond the two custom properties, no DaisyUI classes, no
 * Tailwind utilities. The `BaseComponentProps` passthrough (id / aria-* /
 * data-* / data-testid + the caller-owned `data-part` hook, P-79) spreads on
 * the root BEFORE the engine's stamps so the skin contract always lands last.
 *
 * Keyboard contract (hand-rolled per family — no shared collection hook
 * exists in this wave): every enabled item and submenu trigger remains its
 * own tab stop (the K3-B tab model is preserved); Enter/Space activates.
 * Phase-B Pass 2 ADDS the APG arrow layer on top of that model: orientation
 * -aware arrows move DOM focus between the visible enabled rows with
 * wrap-around (vertical/inline: Up/Down; horizontal: Left/Right, mirrored
 * under RTL), Home/End jump to the first/last row, the forward arrow on a
 * closed submenu trigger opens it (vertical: Right in LTR / Left in RTL;
 * horizontal: Down) and the back arrow closes an open trigger or, on a row
 * nested inside a panel, returns focus to the parent trigger. Focus stays
 * on the trigger when a submenu opens (inline disclosure, not a popup).
 * Typeahead is NOT implemented: the contract declares no axis for it (see
 * the batch-33 ficha). A roving-tabindex model is still deliberately absent.
 *
 * @example
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * // Use Modern engine explicitly
 * <Menu
 *   engine="modern"
 *   items={menuItems}
 *   mode="vertical"
 *   theme="light"
 * />
 *
 * // Or via EngineProvider
 * <EngineProvider engine="modern">
 *   <Menu items={menuItems} mode="horizontal" />
 * </EngineProvider>
 * ```
 *
 * @see {@link MenuProps} for prop documentation
 * @see {@link Menu} for main component
 *
 * @module Menu/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { MenuProps, MenuItem as MenuItemInterface, MenuSelectInfo, MenuClickInfo } from '../../contracts';
import { MENU_DEFAULTS } from '../../contracts';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

// ============================================================================
// Hierarchy data channel (custom properties are configuration, never paint)
// ============================================================================

/**
 * The per-item nesting data the skin's indentation calc reads. Custom
 * properties carry NO paint property (background/border/color/shadow), so
 * this is the one sanctioned inline channel (the Watermark/Stories
 * precedent): the level is runtime data CSS cannot derive.
 */
function getLevelStyleVars(level: number, inlineIndent: number): CSSProperties {
  return {
    ['--rottay-menu-level' as string]: String(level),
    ['--rottay-menu-inline-indent' as string]: `${inlineIndent}px`,
  };
}

// ============================================================================
// MenuItemRow Component
// ============================================================================

/**
 * A single menu item row. The skin paints hover/active/focus/danger/disabled
 * from the data hooks; the engine only stamps them.
 */
function MenuItemRow({
  item,
  isSelected,
  level,
  inlineIndent,
  onItemClick,
}: {
  item: MenuItemInterface;
  isSelected: boolean;
  level: number;
  inlineIndent: number;
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void;
}) {
  const isChild = level > 0;

  return (
    <li key={item.key} data-part="row" role="none">
      <a
        role="menuitem"
        data-part="item"
        data-selected={isSelected}
        data-disabled={item.disabled || undefined}
        data-tone={item.danger ? 'danger' : undefined}
        data-level={isChild ? 'child' : 'top'}
        tabIndex={item.disabled ? -1 : 0}
        style={getLevelStyleVars(level, inlineIndent)}
        aria-disabled={item.disabled || undefined}
        aria-current={isSelected ? 'page' : undefined}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !item.disabled) {
            e.preventDefault();
            onItemClick(item.key, [item.key], e as unknown as React.MouseEvent<HTMLElement>);
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          if (!item.disabled) {
            onItemClick(item.key, [item.key], e as React.MouseEvent<HTMLElement>);
          }
        }}
      >
        {item.icon && <span data-part="icon">{item.icon}</span>}
        <span data-part="label">{item.label}</span>
      </a>
    </li>
  );
}

// ============================================================================
// SubmenuRow Component
// ============================================================================

/**
 * A submenu row with a fully controlled inline disclosure: the trigger is a
 * `div[role="menuitem"]` with `aria-expanded` (a `<summary>` computes as a
 * button, which is an unallowed owned child of `role="menu"` — axe
 * `aria-required-children`), and the group panel only mounts while open so
 * closed submenus never leak items into the accessibility tree.
 */
function SubmenuRow({
  item,
  level,
  inlineIndent,
  openKeys,
  isOpen,
  onSubmenuToggle,
  onItemClick,
  selectedKeys,
  mode,
  expandIcon,
}: {
  item: MenuItemInterface;
  level: number;
  inlineIndent: number;
  openKeys: string[];
  isOpen: boolean;
  onSubmenuToggle: (key: string, nextOpen: boolean) => void;
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void;
  selectedKeys: string[];
  mode: 'vertical' | 'horizontal' | 'inline';
  expandIcon?: React.ReactNode;
}) {
  const hadSelectedDescendantRef = useRef(false);

  const hasSelectedDescendant =
    item.children?.some(function hasSelected(child) {
      if (selectedKeys.includes(child.key)) {
        return true;
      }

      return child.children?.some(hasSelected) ?? false;
    }) ?? false;

  useEffect(() => {
    if (hasSelectedDescendant && !hadSelectedDescendantRef.current && !isOpen) {
      onSubmenuToggle(item.key, true);
    }
    hadSelectedDescendantRef.current = hasSelectedDescendant;
  }, [hasSelectedDescendant, isOpen, item.key, onSubmenuToggle]);

  return (
    <li key={item.key} data-part="row" role="none">
      <div
        style={getLevelStyleVars(level, inlineIndent)}
        data-part="trigger"
        role="menuitem"
        data-disabled={item.disabled || undefined}
        data-level={level > 0 ? 'child' : 'top'}
        tabIndex={item.disabled ? -1 : 0}
        aria-disabled={item.disabled || undefined}
        aria-expanded={isOpen}
        data-open={isOpen ? 'true' : undefined}
        data-selected-descendant={hasSelectedDescendant ? 'true' : undefined}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !item.disabled) {
            e.preventDefault();
            onSubmenuToggle(item.key, !isOpen);
            return;
          }
          // APG disclosure arrows: the forward arrow opens a closed submenu
          // (vertical: Right in LTR / Left in RTL; horizontal menubar: Down),
          // the back arrow closes an open one (vertical: Left in LTR /
          // Right in RTL; horizontal: Up). Focus stays on the trigger —
          // this is an inline disclosure, not a popup handoff. The
          // panel-focus and movement keys live on the root handler.
          const rtl = e.currentTarget.closest('[dir]')?.getAttribute('dir') === 'rtl';
          const forwardKey = mode === 'horizontal' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
          const backKey = mode === 'horizontal' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
          if (e.key === forwardKey && !isOpen && !item.disabled) {
            e.preventDefault();
            onSubmenuToggle(item.key, true);
          } else if (e.key === backKey && isOpen && !item.disabled) {
            e.preventDefault();
            onSubmenuToggle(item.key, false);
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          if (!item.disabled) {
            onSubmenuToggle(item.key, !isOpen);
          }
        }}
      >
        {item.icon && <span data-part="icon">{item.icon}</span>}
        <span data-part="label">{item.label}</span>
        {/* Directional disclosure icon (the contract's `expandIcon` axis
            overrides the governed default chevron; the skin rotates the
            wrapper either way) */}
        <span data-part="arrow-icon" aria-hidden="true">
          {expandIcon ?? <NavigationForwardIcon decorative size={12} />}
        </span>
      </div>
      {isOpen && (
        <ul role="group" data-part="panel">
          {renderModernMenuItems(
            item.children || [],
            onItemClick,
            selectedKeys,
            openKeys,
            onSubmenuToggle,
            level + 1,
            inlineIndent,
            mode,
            expandIcon
          )}
        </ul>
      )}
    </li>
  );
}

// ============================================================================
// Render Helper
// ============================================================================

/**
 * Renders menu items recursively for the modern skin.
 *
 * @param items - Array of menu item configurations
 * @param onItemClick - Click handler for menu items
 * @param selectedKeys - Currently selected item keys
 * @param level - Current nesting level
 * @returns Rendered menu item nodes
 *
 * @internal
 */
function renderModernMenuItems(
  items: MenuItemInterface[],
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void,
  selectedKeys: string[],
  openKeys: string[],
  onSubmenuToggle: (key: string, nextOpen: boolean) => void,
  level: number = 0,
  inlineIndent: number = MENU_DEFAULTS.inlineIndent,
  mode: 'vertical' | 'horizontal' | 'inline' = MENU_DEFAULTS.mode,
  expandIcon?: React.ReactNode
): React.ReactNode {
  return items.map((item) => {
    // Divider
    if (item.type === 'divider') {
      return <li key={item.key} data-part="divider" role="separator" />;
    }

    // Group
    if (item.type === 'group') {
      return (
        <li key={item.key} data-part="group" role="presentation">
          <div data-part="group-label">{item.title || item.label}</div>
          {item.children && (
            <ul role="group" data-part="panel">
              {renderModernMenuItems(
                item.children,
                onItemClick,
                selectedKeys,
                openKeys,
                onSubmenuToggle,
                level + 1,
                inlineIndent,
                mode,
                expandIcon
              )}
            </ul>
          )}
        </li>
      );
    }

    // Submenu with children
    if (item.children && item.children.length > 0) {
      return (
        <SubmenuRow
          key={item.key}
          item={item}
          level={level}
          inlineIndent={inlineIndent}
          openKeys={openKeys}
          isOpen={openKeys.includes(item.key)}
          onSubmenuToggle={onSubmenuToggle}
          onItemClick={onItemClick}
          selectedKeys={selectedKeys}
          mode={mode}
          expandIcon={expandIcon}
        />
      );
    }

    // Regular leaf item
    const isSelected = selectedKeys.includes(item.key);
    return (
      <MenuItemRow
        key={item.key}
        item={item}
        isSelected={isSelected}
        level={level}
        inlineIndent={inlineIndent}
        onItemClick={onItemClick}
      />
    );
  });
}

// ============================================================================
// ModernMenu Component
// ============================================================================

/**
 * Token-driven implementation of the Menu component.
 *
 * @description
 * Renders the Menu component using design-system tokens and the modern skin
 * for a Linear/Vercel-quality sidebar navigation experience.
 *
 * @remarks
 * - Uses DS color tokens (--ds-color-primary, --ds-color-error, --ds-color-text-*)
 * - Fully framed active items without decorative side rails
 * - Layered hover/focus states with smooth transitions
 * - Proper hierarchy with indented child items (logical properties, RTL-safe)
 * - Danger and disabled treatments
 * - Keyboard accessible with focus-visible ring
 *
 * @param props - {@link MenuProps}
 * @returns Rendered ModernMenu component
 *
 * @example
 * ```tsx
 * <ModernMenu
 *   items={menuItems}
 *   mode="horizontal"
 *   selectedKeys={['dashboard']}
 *   onSelect={handleSelect}
 * />
 * ```
 */
export default function ModernMenu(props: MenuProps): React.ReactElement {
  const {
    items,
    mode = MENU_DEFAULTS.mode,
    selectedKeys: controlledSelectedKeys,
    defaultSelectedKeys = [],
    openKeys: controlledOpenKeys,
    defaultOpenKeys = [],
    multiple = MENU_DEFAULTS.multiple,
    selectable = MENU_DEFAULTS.selectable,
    inlineCollapsed = MENU_DEFAULTS.inlineCollapsed,
    onSelect,
    onClick,
    onOpenChange,
    theme = MENU_DEFAULTS.theme,
    children,
    className = '',
    style,
    inlineIndent = MENU_DEFAULTS.inlineIndent,
    expandIcon,
    'data-part': dataPart,
    engine: _engine,
    // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to
    // the root element. It spreads BEFORE the engine's own stamps so the
    // skin and keyboard contracts (data-part default, role, aria-orientation,
    // data-mode/data-collapsed/data-has-selection) always land last (the Card
    // modern idiom; contracts promise BaseComponentProps pass-through).
    ...rest
  } = props;

  // ========================================================================
  // State Management
  // ========================================================================

  /** Internal state for uncontrolled selection mode */
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);

  /** Internal state for uncontrolled submenu expansion mode */
  const [internalOpenKeys, setInternalOpenKeys] = useState<string[]>(defaultOpenKeys);

  /** Use controlled or uncontrolled state */
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
  const openKeys = controlledOpenKeys ?? internalOpenKeys;

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles submenu expansion state.
   * Keeps the modern engine aligned with the Menu openKeys contract.
   */
  const handleSubmenuToggle = useCallback(
    (key: string, nextOpen: boolean) => {
      const alreadyOpen = openKeys.includes(key);

      if ((nextOpen && alreadyOpen) || (!nextOpen && !alreadyOpen)) {
        return;
      }

      const nextOpenKeys = nextOpen ? [...openKeys, key] : openKeys.filter((openKey) => openKey !== key);

      if (controlledOpenKeys === undefined) {
        setInternalOpenKeys(nextOpenKeys);
      }

      onOpenChange?.(nextOpenKeys);
    },
    [openKeys, controlledOpenKeys, onOpenChange]
  );

  /**
   * Handles menu item click events.
   * Manages selection state and triggers callbacks.
   */
  const handleItemClick = useCallback(
    (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => {
      // Fire click callback first
      const clickInfo: MenuClickInfo = {
        key,
        keyPath,
        domEvent: e,
      };
      onClick?.(clickInfo);

      // Handle selection if selectable
      if (selectable) {
        let newSelectedKeys: string[];

        if (multiple) {
          newSelectedKeys = selectedKeys.includes(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key];
        } else {
          newSelectedKeys = [key];
        }

        // Only update internal state when running in uncontrolled mode
        if (controlledSelectedKeys === undefined) {
          setInternalSelectedKeys(newSelectedKeys);
        }

        const selectInfo: MenuSelectInfo = {
          key,
          selectedKeys: newSelectedKeys,
          keyPath,
        };
        onSelect?.(selectInfo);
      }
    },
    [selectedKeys, multiple, selectable, controlledSelectedKeys, onClick, onSelect]
  );

  // ========================================================================
  // Keyboard Navigation (APG arrow layer on top of the tab-stop model)
  // ========================================================================

  /**
   * Orientation-aware arrow/Home/End focus movement between the visible
   * enabled rows. Runs at the root so closed submenus (whose panels are
   * unmounted) simply drop out of the focus order — the query always sees
   * exactly the rows a keyboard user can reach. Enter/Space stay owned by
   * the row handlers above; the trigger disclosure arrows live in
   * SubmenuRow (they need the item key and the open state).
   */
  const handleRootKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      const root = e.currentTarget;
      const row = (e.target as HTMLElement).closest("[data-part='item'], [data-part='trigger']");
      if (!row || !root.contains(row)) return;

      const horizontal = mode === 'horizontal';
      const rtl = root.closest('[dir]')?.getAttribute('dir') === 'rtl';

      const focusableRows = Array.from(
        root.querySelectorAll("[data-part='item']:not([data-disabled]), [data-part='trigger']:not([data-disabled])")
      ) as HTMLElement[];
      const currentIndex = focusableRows.indexOf(row as HTMLElement);
      if (currentIndex === -1) return;

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown':
          if (horizontal) return; // horizontal menubar: Down is the trigger's open key
          nextIndex = (currentIndex + 1) % focusableRows.length;
          break;
        case 'ArrowUp':
          if (horizontal) return; // horizontal menubar: Up is the trigger's close key
          nextIndex = (currentIndex - 1 + focusableRows.length) % focusableRows.length;
          break;
        case 'ArrowRight': {
          if (!horizontal) {
            // Vertical RTL back key: return focus from a panel row to its
            // parent trigger (the panel stays open — inline disclosure).
            // In LTR, Right is the trigger's forward/open key (row-owned).
            if (rtl) {
              const panel = (row as HTMLElement).closest("[data-part='panel']");
              const parentTrigger = panel?.parentElement?.querySelector(
                ":scope > [data-part='trigger']:not([data-disabled])"
              ) as HTMLElement | null;
              if (parentTrigger) {
                e.preventDefault();
                parentTrigger.focus();
              }
            }
            return;
          }
          nextIndex = rtl
            ? (currentIndex - 1 + focusableRows.length) % focusableRows.length
            : (currentIndex + 1) % focusableRows.length;
          break;
        }
        case 'ArrowLeft': {
          if (!horizontal) {
            // Vertical LTR back key: panel row → parent trigger. In RTL,
            // Left is the trigger's forward/open key (row-owned).
            if (!rtl) {
              const panel = (row as HTMLElement).closest("[data-part='panel']");
              const parentTrigger = panel?.parentElement?.querySelector(
                ":scope > [data-part='trigger']:not([data-disabled])"
              ) as HTMLElement | null;
              if (parentTrigger) {
                e.preventDefault();
                parentTrigger.focus();
              }
            }
            return;
          }
          nextIndex = rtl
            ? (currentIndex + 1) % focusableRows.length
            : (currentIndex - 1 + focusableRows.length) % focusableRows.length;
          break;
        }
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = focusableRows.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        focusableRows[nextIndex]?.focus();
      }
    },
    [mode]
  );

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <ul
      {...rest}
      className={`rottay-menu rottay-menu--modern rottay-menu--${theme} ${className}`.trim()}
      style={style}
      role="menu"
      aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
      data-part={dataPart ?? 'root'}
      data-mode={mode}
      data-collapsed={inlineCollapsed || undefined}
      data-has-selection={selectedKeys.length > 0 || undefined}
      onKeyDown={handleRootKeyDown}
    >
      {items
        ? renderModernMenuItems(items, handleItemClick, selectedKeys, openKeys, handleSubmenuToggle, 0, inlineIndent, mode, expandIcon)
        : children}
    </ul>
  );
}

ModernMenu.displayName = 'ModernMenu';
