/**
 * @fileoverview Menu Modern Engine - Rottay Design System
 * @description Premium CSS-in-JS implementation of the Menu component.
 * Part of the Rottay Design System's multi-engine architecture.
 *
 * @remarks
 * The Modern engine uses design-system tokens and inline styles to deliver
 * a Linear/Vercel-quality sidebar menu with:
 * - Left accent bar for active items
 * - Subtle hover backgrounds
 * - Consistent item heights and spacing
 * - Proper hierarchy for submenu children
 * - Danger/disabled/focus-visible treatments
 * - Smooth 150ms ease-out transitions
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
import type { MenuProps, MenuItem as MenuItemInterface, MenuSelectInfo, MenuClickInfo } from '../Menu.types';
import { MENU_DEFAULTS } from '../Menu.types';

// ============================================================================
// Style Constants
// ============================================================================

/** Height for top-level menu items */
const ITEM_HEIGHT_TOP = 44;
/** Height for child/nested menu items */
const ITEM_HEIGHT_CHILD = 40;
/** Horizontal padding for menu items */
const ITEM_PADDING_X = 12;
/** Gap between icon and label */
const ICON_LABEL_GAP = 12;
/** Left indent for child items (accounts for icon width) */
const CHILD_INDENT = 40;
/** Width of the active accent bar */
const ACCENT_BAR_WIDTH = 3;
/** Border radius token */
const RADIUS = 'var(--ds-radius-md, 8px)';
/** Transition for interactive states */
const TRANSITION = 'background 150ms ease-out, color 150ms ease-out, opacity 150ms ease-out';

// ============================================================================
// Inline Style Builders
// ============================================================================

/**
 * Builds the base style for a menu item anchor/button.
 */
function getItemBaseStyle(level: number): CSSProperties {
  const isChild = level > 0;
  return {
    display: 'flex',
    alignItems: 'center',
    gap: ICON_LABEL_GAP,
    height: isChild ? ITEM_HEIGHT_CHILD : ITEM_HEIGHT_TOP,
    padding: `0 ${ITEM_PADDING_X}px`,
    paddingLeft: isChild ? CHILD_INDENT : ITEM_PADDING_X,
    borderRadius: RADIUS,
    fontSize: isChild ? 14 : 15,
    fontWeight: 400,
    lineHeight: 1.4,
    color: 'var(--ds-color-text-secondary)',
    textDecoration: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: TRANSITION,
    border: 'none',
    background: 'transparent',
    width: '100%',
    boxSizing: 'border-box' as const,
    textAlign: 'left' as const,
    outline: 'none',
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
  };
}

/**
 * Overlay styles for the active/selected state.
 */
function getActiveStyle(level: number): CSSProperties {
  if (level > 0) {
    // Children: no accent bar, just bolder text and subtle bg
    return {
      background: 'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
      fontWeight: 500,
      color: 'var(--ds-color-primary)',
    };
  }
  return {
    background: 'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
    fontWeight: 500,
    color: 'var(--ds-color-primary)',
  };
}

/**
 * Style for the left accent bar (only top-level active items).
 */
function getAccentBarStyle(): CSSProperties {
  return {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: ACCENT_BAR_WIDTH,
    height: '60%',
    borderRadius: ACCENT_BAR_WIDTH,
    background: 'var(--ds-color-primary)',
    transition: 'opacity 150ms ease-out, height 150ms ease-out',
  };
}

/**
 * Style for danger items.
 */
function getDangerStyle(): CSSProperties {
  return {
    color: 'var(--ds-color-error)',
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
function getSummaryStyle(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: ICON_LABEL_GAP,
    height: ITEM_HEIGHT_TOP,
    padding: `0 ${ITEM_PADDING_X}px`,
    borderRadius: RADIUS,
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.4,
    color: 'var(--ds-color-text-secondary)',
    cursor: 'pointer',
    position: 'relative',
    transition: TRANSITION,
    listStyle: 'none',
    textAlign: 'left' as const,
    outline: 'none',
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
  };
}

/**
 * Style for group title headers.
 */
function getGroupTitleStyle(): CSSProperties {
  return {
    padding: `16px ${ITEM_PADDING_X}px 6px`,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--ds-color-text-muted)',
    lineHeight: 1.4,
    userSelect: 'none' as const,
  };
}

/**
 * Style for dividers.
 */
function getDividerStyle(): CSSProperties {
  return {
    height: 1,
    margin: '8px 12px',
    background: 'var(--ds-color-border)',
    border: 'none',
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
  onItemClick,
}: {
  item: MenuItemInterface;
  isSelected: boolean;
  level: number;
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isChild = level > 0;

  const baseStyle = getItemBaseStyle(level);

  // Compose final style
  let composedStyle: CSSProperties = { ...baseStyle };

  // Hover state (only when not disabled and not already selected)
  if (isHovered && !item.disabled && !isSelected) {
    composedStyle = {
      ...composedStyle,
      background: item.danger
        ? 'color-mix(in srgb, var(--ds-color-error) 6%, transparent)'
        : 'color-mix(in srgb, var(--ds-color-primary) 5%, transparent)',
    };
  }

  // Active/selected state
  if (isSelected) {
    composedStyle = {
      ...composedStyle,
      ...getActiveStyle(level),
    };
  }

  // Danger color
  if (item.danger && !isSelected) {
    composedStyle = {
      ...composedStyle,
      ...getDangerStyle(),
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
    <li key={item.key} style={{ listStyle: 'none', margin: '2px 0' }}>
      <a
        role="menuitem"
        tabIndex={item.disabled ? -1 : 0}
        style={composedStyle}
        aria-disabled={item.disabled || undefined}
        aria-current={isSelected ? 'page' : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={(e) => {
          // Apply focus-visible ring via inline style
          if (e.currentTarget.matches(':focus-visible')) {
            e.currentTarget.style.outline = '2px solid var(--ds-color-primary)';
            e.currentTarget.style.outlineOffset = '-2px';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
          e.currentTarget.style.outlineOffset = '0';
        }}
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
        {isSelected && !isChild && (
          <span
            aria-hidden="true"
            style={getAccentBarStyle()}
          />
        )}
        {item.icon && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: 20,
              height: 20,
              fontSize: 18,
              opacity: isSelected ? 1 : 0.7,
              transition: 'opacity 150ms ease-out',
            }}
          >
            {item.icon}
          </span>
        )}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
  onItemClick,
  selectedKeys,
}: {
  item: MenuItemInterface;
  level: number;
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void;
  selectedKeys: string[];
}) {
  const [isHovered, setIsHovered] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Check if any child is selected (to auto-open the submenu)
  const hasSelectedChild = item.children?.some((child) => selectedKeys.includes(child.key)) ?? false;

  // Auto-open if a child is selected
  useEffect(() => {
    if (hasSelectedChild && detailsRef.current) {
      detailsRef.current.open = true;
    }
  }, [hasSelectedChild]);

  const summaryStyle: CSSProperties = {
    ...getSummaryStyle(),
    ...(item.disabled ? getDisabledStyle() : {}),
    ...(isHovered && !item.disabled
      ? { background: 'color-mix(in srgb, var(--ds-color-primary) 5%, transparent)' }
      : {}),
  };

  return (
    <li key={item.key} style={{ listStyle: 'none', margin: '2px 0' }}>
      <details ref={detailsRef} open={hasSelectedChild || undefined}>
        <summary
          style={summaryStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={(e) => {
            if (e.currentTarget.matches(':focus-visible')) {
              e.currentTarget.style.outline = '2px solid var(--ds-color-primary)';
              e.currentTarget.style.outlineOffset = '-2px';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
            e.currentTarget.style.outlineOffset = '0';
          }}
        >
          {item.icon && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: 20,
                height: 20,
                fontSize: 18,
                opacity: 0.7,
                transition: 'opacity 150ms ease-out',
              }}
            >
              {item.icon}
            </span>
          )}
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.label}
          </span>
          {/* Chevron indicator */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              flexShrink: 0,
              opacity: 0.4,
              transition: 'transform 150ms ease-out',
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{ display: 'block' }}
            >
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
          style={{
            listStyle: 'none',
            padding: '2px 0 2px 0',
            margin: 0,
          }}
        >
          {renderModernMenuItems(item.children || [], onItemClick, selectedKeys, level + 1)}
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
  level: number = 0
): React.ReactNode {
  return items.map((item) => {
    // Divider
    if (item.type === 'divider') {
      return <li key={item.key} style={getDividerStyle()} aria-hidden="true" />;
    }

    // Group
    if (item.type === 'group') {
      return (
        <li key={item.key} role="presentation" style={{ listStyle: 'none' }}>
          <div style={getGroupTitleStyle()}>{item.title || item.label}</div>
          {item.children && (
            <ul role="group" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {renderModernMenuItems(item.children, onItemClick, selectedKeys, level + 1)}
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
        onItemClick={onItemClick}
      />
    );
  });
}

// ============================================================================
// Global CSS injection for :focus-visible and details[open] chevron rotation
// ============================================================================

const MODERN_MENU_STYLE_ID = 'rottay-menu-modern-styles';

function ensureGlobalStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(MODERN_MENU_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = MODERN_MENU_STYLE_ID;
  style.textContent = `
    .rottay-menu--modern a:focus-visible,
    .rottay-menu--modern summary:focus-visible {
      outline: 2px solid var(--ds-color-primary) !important;
      outline-offset: -2px !important;
    }
    .rottay-menu--modern details[open] > summary > span:last-child {
      transform: rotate(90deg);
    }
    .rottay-menu--modern summary::-webkit-details-marker,
    .rottay-menu--modern summary::marker {
      display: none;
      content: '';
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// ModernMenu Component
// ============================================================================

/**
 * Premium CSS-in-JS implementation of the Menu component.
 *
 * @description
 * Renders the Menu component using design-system tokens and inline styles
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
    multiple = MENU_DEFAULTS.multiple,
    selectable = MENU_DEFAULTS.selectable,
    inlineCollapsed = MENU_DEFAULTS.inlineCollapsed,
    onSelect,
    onClick,
    theme = MENU_DEFAULTS.theme,
    children,
    className = '',
    style,
  } = props;

  // ========================================================================
  // Global Styles
  // ========================================================================

  useEffect(() => {
    ensureGlobalStyles();
  }, []);

  // ========================================================================
  // State Management
  // ========================================================================

  /** Internal state for uncontrolled selection mode */
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);

  /** Use controlled or uncontrolled state */
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  // ========================================================================
  // Event Handlers
  // ========================================================================

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
          newSelectedKeys = selectedKeys.includes(key)
            ? selectedKeys.filter((k) => k !== key)
            : [...selectedKeys, key];
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
    gap: isHorizontal ? 4 : 2,
    listStyle: 'none',
    padding: isHorizontal ? '0 8px' : '8px',
    margin: 0,
    background: theme === 'dark' ? 'var(--ds-surface-panel)' : 'var(--ds-surface-card)',
    borderRadius: RADIUS,
    fontFamily: 'var(--ds-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    ...(inlineCollapsed ? { width: 64, overflow: 'hidden' } : {}),
    ...style,
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <ul
      className={`rottay-menu rottay-menu--modern ${className}`.trim()}
      style={menuStyle}
      role="menu"
    >
      {items
        ? renderModernMenuItems(items, handleItemClick, selectedKeys)
        : children}
    </ul>
  );
}

ModernMenu.displayName = 'ModernMenu';
