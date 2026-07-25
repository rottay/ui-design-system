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
 * Tailwind utilities.
 *
 * Keyboard contract (hand-rolled per family — no shared collection hook
 * exists in this wave): every enabled item and submenu trigger is its own
 * tab stop; Enter/Space activates. A roving-tabindex/arrows model is NOT
 * implemented (see the K3-B ficha).
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
}: {
  item: MenuItemInterface;
  level: number;
  inlineIndent: number;
  openKeys: string[];
  isOpen: boolean;
  onSubmenuToggle: (key: string, nextOpen: boolean) => void;
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void;
  selectedKeys: string[];
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
        {/* Directional disclosure icon */}
        <span data-part="arrow-icon" aria-hidden="true">
          <NavigationForwardIcon decorative size={12} />
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
            inlineIndent
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
  inlineIndent: number = MENU_DEFAULTS.inlineIndent
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
                inlineIndent
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
  // Render
  // ========================================================================

  return (
    <ul
      className={`rottay-menu rottay-menu--modern rottay-menu--${theme} ${className}`.trim()}
      style={style}
      role="menu"
      data-part="root"
      data-mode={mode}
      data-collapsed={inlineCollapsed || undefined}
      data-has-selection={selectedKeys.length > 0 || undefined}
    >
      {items
        ? renderModernMenuItems(items, handleItemClick, selectedKeys, openKeys, handleSubmenuToggle, 0, inlineIndent)
        : children}
    </ul>
  );
}

ModernMenu.displayName = 'ModernMenu';
