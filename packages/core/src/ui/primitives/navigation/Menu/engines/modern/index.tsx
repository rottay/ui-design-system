/**
 * @fileoverview Menu Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Menu component.
 * Part of the Rottay Design System's multi-engine architecture.
 *
 * @remarks
 * The Modern engine uses design-system tokens, structural inline layout, and
 * the unlayered modern skin to deliver
 * a Linear/Vercel-quality sidebar menu with:
 * - Left accent bar for active items
 * - Subtle hover backgrounds
 * - Consistent item heights and spacing
 * - Proper hierarchy for submenu children
 * - Danger/disabled/focus-visible treatments
 * - Smooth var(--ds-motion-fast) ease-out transitions
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

// ============================================================================
// Style Constants
// ============================================================================

/** Height for top-level menu items */
const ITEM_HEIGHT_TOP = 'var(--ds-sidebar-item-height, 62px)';
/** Height for child/nested menu items */
const ITEM_HEIGHT_CHILD = 'var(--ds-sidebar-item-child-height, 45px)';
/** Horizontal padding for menu items */
const ITEM_PADDING_X = 'var(--ds-sidebar-item-padding-inline, 16px)';
/** Horizontal padding for child menu items */
const CHILD_ITEM_PADDING_X = 'var(--ds-sidebar-child-padding-inline, 8px)';
/** Gap between icon and label */
const ICON_LABEL_GAP = 'var(--ds-sidebar-item-gap, 10px)';
/** Width of the active accent bar */
const ACCENT_BAR_WIDTH = 3;
/** Border radius token */
const RADIUS = 'var(--ds-radius-lg, 12px)';
/** Transition for interactive states */
const TRANSITION =
  'background var(--ds-motion-fast) ease-out, color var(--ds-motion-fast) ease-out, opacity var(--ds-motion-fast) ease-out';

function getItemPaddingLeft(level: number, inlineIndent: number): string {
  if (level <= 0) {
    return ITEM_PADDING_X;
  }

  return `calc(${CHILD_ITEM_PADDING_X} + ${level * inlineIndent}px)`;
}

function getLevelStyleVars(level: number, inlineIndent: number): CSSProperties {
  const paddingLeft = getItemPaddingLeft(level, inlineIndent);

  return {
    ['--rottay-menu-level' as string]: String(level),
    ['--rottay-menu-inline-indent' as string]: `${inlineIndent}px`,
    ['--rottay-menu-item-padding-left' as string]: paddingLeft,
  };
}

// ============================================================================
// Inline Style Builders
// ============================================================================

/**
 * Builds the base style for a menu item anchor/button.
 */
function getItemBaseStyle(level: number, inlineIndent: number): CSSProperties {
  const isChild = level > 0;
  return {
    ...getLevelStyleVars(level, inlineIndent),
    display: 'flex',
    alignItems: 'center',
    gap: ICON_LABEL_GAP,
    height: isChild ? ITEM_HEIGHT_CHILD : ITEM_HEIGHT_TOP,
    paddingTop: 0,
    paddingRight: isChild ? CHILD_ITEM_PADDING_X : ITEM_PADDING_X,
    paddingBottom: 0,
    paddingLeft: 'var(--rottay-menu-item-padding-left)',
    fontSize: isChild ? 'var(--ds-sidebar-item-font-size-child, 13.9px)' : 'var(--ds-sidebar-item-font-size, 15.75px)',
    fontWeight: 500,
    lineHeight: 1.28,
    textDecoration: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: TRANSITION,
    width: '100%',
    boxSizing: 'border-box' as const,
    textAlign: 'left' as const,
    justifyContent: 'flex-start',
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
  };
}

/**
 * Non-paint overlay for the active/selected state; the tint and the text color
 * ride `data-selected` + `data-level` in the skin.
 */
function getActiveStyle(): CSSProperties {
  return {
    fontWeight: 600,
  };
}

/**
 * Style for the left accent bar (only top-level active items).
 */
function getAccentBarStyle(): CSSProperties {
  return {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 2.5,
    height: '64%',
    transition: 'opacity var(--ds-motion-fast) ease-out, height var(--ds-motion-fast) ease-out',
  };
}

/**
 * Style for disabled items.
 */
function getDisabledStyle(): CSSProperties {
  return {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none' as const,
  };
}

/**
 * Style for submenu summary/trigger elements.
 */
function getSummaryStyle(level: number, inlineIndent: number): CSSProperties {
  const isChild = level > 0;

  return {
    ...getLevelStyleVars(level, inlineIndent),
    display: 'flex',
    alignItems: 'center',
    gap: ICON_LABEL_GAP,
    height: isChild ? ITEM_HEIGHT_CHILD : ITEM_HEIGHT_TOP,
    paddingTop: 0,
    paddingRight: isChild ? CHILD_ITEM_PADDING_X : ITEM_PADDING_X,
    paddingBottom: 0,
    paddingLeft: 'var(--rottay-menu-item-padding-left)',
    fontSize: isChild ? 'var(--ds-sidebar-item-font-size-child, 13.9px)' : 'var(--ds-sidebar-item-font-size, 15.75px)',
    fontWeight: 500,
    lineHeight: 1.28,
    cursor: 'pointer',
    position: 'relative',
    transition: TRANSITION,
    listStyle: 'none',
    textAlign: 'left' as const,
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
  };
}

/**
 * Style for group title headers.
 */
function getGroupTitleStyle(): CSSProperties {
  return {
    padding: `6px ${ITEM_PADDING_X} 3px`,
    fontSize: 'var(--ds-sidebar-group-font-size, 10.9px)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.085em',
    lineHeight: 1.1,
    userSelect: 'none' as const,
  };
}

/**
 * Style for dividers.
 */
function getDividerStyle(): CSSProperties {
  return {
    height: 1,
    margin: '4px 8px',
    listStyle: 'none',
  };
}

// ============================================================================
// MenuItemRow Component
// ============================================================================

/**
 * A single menu item row with hover, active, focus, danger, and disabled states.
 * Uses a ref-based approach for hover state to inject CSS pseudo-class behavior
 * via inline styles (since inline styles cannot express :hover or :focus-visible).
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

  const baseStyle = getItemBaseStyle(level, inlineIndent);

  // Compose final style
  let composedStyle: CSSProperties = { ...baseStyle };

  // Active/selected state
  if (isSelected) {
    composedStyle = {
      ...composedStyle,
      ...getActiveStyle(),
    };
  }

  // Disabled state (applied last to override everything)
  if (item.disabled) {
    composedStyle = {
      ...composedStyle,
      ...getDisabledStyle(),
    };
  }

  return (
    <li key={item.key} style={{ listStyle: 'none', margin: '0.5px 0' }}>
      <a
        role="menuitem"
        data-part="item"
        data-selected={isSelected}
        data-disabled={item.disabled || undefined}
        data-tone={item.danger ? 'danger' : undefined}
        data-level={isChild ? 'child' : 'top'}
        tabIndex={item.disabled ? -1 : 0}
        style={composedStyle}
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
        {/* Left accent bar for active top-level items */}
        {isSelected && !isChild && <span data-part="indicator" aria-hidden="true" style={getAccentBarStyle()} />}
        {item.icon && (
          <span
            data-part="icon"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              flexShrink: 0,
              width: 'var(--ds-sidebar-icon-column-size, 22px)',
              height: 'var(--ds-sidebar-icon-column-size, 22px)',
              fontSize: 'var(--ds-sidebar-icon-size, 17.25px)',
              opacity: isSelected ? 1 : 0.7,
              transition: 'opacity var(--ds-motion-fast) ease-out',
            }}
          >
            {item.icon}
          </span>
        )}
        <span
          data-part="label"
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </span>
      </a>
    </li>
  );
}

// ============================================================================
// SubmenuRow Component
// ============================================================================

/**
 * A submenu row with a collapsible <details>/<summary> pattern.
 * Applies the same hover/focus treatment as regular items on the summary trigger.
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
  const [isHovered, setIsHovered] = useState(false);
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

  const summaryStyle: CSSProperties = {
    ...getSummaryStyle(level, inlineIndent),
    ...(item.disabled ? getDisabledStyle() : {}),
  };

  return (
    <li key={item.key} style={{ listStyle: 'none', margin: '0.5px 0' }}>
      <details open={isOpen}>
        <summary
          style={summaryStyle}
          data-part="trigger"
          data-disabled={item.disabled || undefined}
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
          {item.icon && (
            <span
              data-part="icon"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexShrink: 0,
                width: 'var(--ds-sidebar-icon-column-size, 22px)',
                height: 'var(--ds-sidebar-icon-column-size, 22px)',
                fontSize: 'var(--ds-sidebar-icon-size, 17.25px)',
                opacity: 0.7,
                transition: 'opacity var(--ds-motion-fast) ease-out',
              }}
            >
              {item.icon}
            </span>
          )}
          <span
            data-part="label"
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </span>
          {/* Chevron indicator */}
          <span
            data-part="arrow-icon"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 14,
              height: 14,
              flexShrink: 0,
              opacity: 0.4,
              transition: 'transform var(--ds-motion-fast) ease-out',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: 'block' }}>
              <path
                d="M4.5 3L7.5 6L4.5 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <ul
          role="group"
          data-part="panel"
          style={{
            listStyle: 'none',
            padding: '0 0 1px 0',
            margin: 0,
          }}
        >
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
      </details>
    </li>
  );
}

// ============================================================================
// Render Helper
// ============================================================================

/**
 * Renders menu items recursively using the premium Modern styling.
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
      return <li key={item.key} data-part="divider" style={getDividerStyle()} aria-hidden="true" />;
    }

    // Group
    if (item.type === 'group') {
      return (
        <li key={item.key} data-part="group" role="presentation" style={{ listStyle: 'none' }}>
          <div data-part="group-label" style={getGroupTitleStyle()}>
            {item.title || item.label}
          </div>
          {item.children && (
            <ul role="group" data-part="panel" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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
 * - Left accent bar on active top-level items
 * - Subtle hover/focus states with smooth transitions
 * - Proper hierarchy with indented child items
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
  // Styles
  // ========================================================================

  const isHorizontal = mode === 'horizontal';

  const menuStyle: CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    gap: isHorizontal ? 4 : 3,
    listStyle: 'none',
    padding: isHorizontal ? '0 8px' : '10px 8px',
    margin: 0,
    fontFamily: 'var(--ds-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    ...(inlineCollapsed ? { width: 64, overflow: 'hidden' } : {}),
    ...style,
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <ul
      className={`rottay-menu rottay-menu--modern rottay-menu--${theme} ${className}`.trim()}
      style={menuStyle}
      role="menu"
      data-part="root"
    >
      {items
        ? renderModernMenuItems(items, handleItemClick, selectedKeys, openKeys, handleSubmenuToggle, 0, inlineIndent)
        : children}
    </ul>
  );
}

ModernMenu.displayName = 'ModernMenu';
