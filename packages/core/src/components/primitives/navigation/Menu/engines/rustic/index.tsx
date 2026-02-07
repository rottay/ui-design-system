/**
 * @fileoverview Menu Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Menu component with
 * comprehensive keyboard navigation. Part of the Rottay Design System's
 * multi-engine architecture.
 *
 * @remarks
 * The Rustic engine provides a zero-dependency implementation of the Menu
 * component with:
 * - Pure HTML/CSS rendering (no UI framework dependencies)
 * - Full keyboard navigation (Arrow keys, Enter, Space, Home, End, Escape)
 * - WCAG 2.1 AA compliant accessibility
 * - Focus management with visual indicators
 * - Controlled and uncontrolled state support
 * - CSS variable-based theming
 *
 * This implementation is ideal for:
 * - Maximum accessibility requirements
 * - Custom styling without framework constraints
 * - Minimal bundle size requirements
 * - Server-side rendering optimization
 *
 * @example
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * // Use Rustic engine explicitly
 * <Menu
 *   engine="rustic"
 *   items={menuItems}
 *   mode="vertical"
 *   theme="light"
 * />
 *
 * // Or via EngineProvider
 * <EngineProvider engine="rustic">
 *   <Menu items={menuItems} mode="inline" />
 * </EngineProvider>
 * ```
 *
 * @see {@link MenuProps} for prop documentation
 * @see {@link Menu} for main component
 *
 * @module Menu/Engines/Rustic
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import type { MenuProps, MenuItem as MenuItemInterface, MenuSelectInfo, MenuClickInfo } from '../../types';
import { MENU_DEFAULTS } from '../../types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets all focusable menu item keys from the items array.
 *
 * @description
 * Recursively traverses the menu structure to collect keys of all
 * focusable items (non-divider, non-disabled items).
 *
 * @param items - Array of menu item configurations
 * @returns Array of focusable item keys
 *
 * @internal
 */
function getFocusableKeys(items: MenuItemInterface[]): string[] {
  const keys: string[] = [];

  items.forEach((item) => {
    // Skip dividers
    if (item.type === 'divider') return;
    // Skip disabled items
    if (item.disabled) return;

    if (item.children && item.children.length > 0) {
      // Include submenu key and its children
      keys.push(item.key);
      keys.push(...getFocusableKeys(item.children));
    } else if (item.type !== 'group') {
      // Regular item
      keys.push(item.key);
    } else if (item.children) {
      // Group with children
      keys.push(...getFocusableKeys(item.children));
    }
  });

  return keys;
}

/**
 * Renders Rustic menu items recursively.
 *
 * @description
 * Transforms the menu items array into accessible HTML elements
 * with focus management and keyboard navigation support.
 *
 * @param items - Array of menu item configurations
 * @param onItemClick - Click handler for menu items
 * @param selectedKeys - Currently selected item keys
 * @param focusedKey - Currently focused item key
 * @param openKeys - Currently open submenu keys
 * @param onSubmenuToggle - Handler for submenu toggle
 * @param inlineIndent - Indentation size for nested items
 * @param level - Current nesting level
 * @returns Rendered Rustic menu item nodes
 *
 * @internal
 */
function renderRusticMenuItems(
  items: MenuItemInterface[],
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void,
  selectedKeys: string[],
  focusedKey: string | null,
  openKeys: string[],
  onSubmenuToggle: (key: string) => void,
  inlineIndent: number,
  level: number = 0
): React.ReactNode {
  return items.map((item) => {
    const paddingLeft = level > 0 ? level * inlineIndent : undefined;

    // Handle divider type
    if (item.type === 'divider') {
      return (
        <li
          key={item.key}
          role="separator"
          style={{
            height: '1px',
            margin: '8px 0',
            backgroundColor: 'var(--ds-menu-divider-color, rgba(0, 0, 0, 0.06))',
          }}
        />
      );
    }

    // Handle group type
    if (item.type === 'group') {
      return (
        <li key={item.key} role="presentation">
          <div
            style={{
              padding: '8px 16px 4px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ds-menu-group-title-color, rgba(0, 0, 0, 0.45))',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              paddingLeft: paddingLeft ? `${paddingLeft}px` : undefined,
            }}
          >
            {item.title || item.label}
          </div>
          {item.children && (
            <ul role="group" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {renderRusticMenuItems(
                item.children,
                onItemClick,
                selectedKeys,
                focusedKey,
                openKeys,
                onSubmenuToggle,
                inlineIndent,
                level + 1
              )}
            </ul>
          )}
        </li>
      );
    }

    // Handle submenu (item with children)
    if (item.children && item.children.length > 0) {
      const isOpen = openKeys.includes(item.key);
      const isFocused = focusedKey === item.key;

      return (
        <li key={item.key} role="presentation">
          {/* Submenu title bar */}
          <div
            role="button"
            tabIndex={item.disabled ? -1 : 0}
            aria-expanded={isOpen}
            aria-haspopup="true"
            aria-disabled={item.disabled}
            data-key={item.key}
            onClick={() => {
              if (!item.disabled) {
                onSubmenuToggle(item.key);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              paddingLeft: paddingLeft ? `${paddingLeft}px` : undefined,
              minHeight: '40px',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              opacity: item.disabled ? 0.5 : 1,
              color: 'var(--ds-menu-item-color, inherit)',
              backgroundColor: isFocused ? 'var(--ds-menu-item-hover-bg, rgba(0, 0, 0, 0.04))' : 'transparent',
              borderRadius: 'var(--ds-menu-border-radius, 6px)',
              transition: 'all 0.2s ease',
              outline: isFocused ? '2px solid var(--ds-menu-focus-ring, var(--ds-color-primary-500, #1677ff))' : 'none',
              outlineOffset: '-2px',
            }}
          >
            {item.icon && <span>{item.icon}</span>}
            <span style={{ flex: 1 }}>{item.label}</span>
            {/* Expand icon with rotation */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                transition: 'transform 0.2s ease',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Nested content */}
          <ul
            role="menu"
            aria-hidden={!isOpen}
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              height: isOpen ? 'auto' : 0,
              overflow: 'hidden',
              transition: 'height 0.2s ease',
            }}
          >
            {renderRusticMenuItems(
              item.children,
              onItemClick,
              selectedKeys,
              focusedKey,
              openKeys,
              onSubmenuToggle,
              inlineIndent,
              level + 1
            )}
          </ul>
        </li>
      );
    }

    // Handle regular menu item
    const isSelected = selectedKeys.includes(item.key);
    const isFocused = focusedKey === item.key;

    return (
      <li key={item.key} role="presentation">
        <div
          role="menuitem"
          tabIndex={item.disabled ? -1 : 0}
          aria-disabled={item.disabled}
          data-key={item.key}
          onClick={(e) => {
            if (!item.disabled) {
              onItemClick(item.key, [item.key], e as React.MouseEvent<HTMLElement>);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            paddingLeft: paddingLeft ? `${paddingLeft}px` : undefined,
            minHeight: '40px',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            opacity: item.disabled ? 0.5 : 1,
            color: item.danger
              ? 'var(--ds-menu-item-danger-color, var(--ds-color-error-500, #ff4d4f))'
              : isSelected
                ? 'var(--ds-menu-item-selected-color, var(--ds-color-primary-500, #1677ff))'
                : 'var(--ds-menu-item-color, inherit)',
            backgroundColor: isSelected
              ? 'var(--ds-menu-item-selected-bg, rgba(22, 119, 255, 0.08))'
              : isFocused
                ? 'var(--ds-menu-item-hover-bg, rgba(0, 0, 0, 0.04))'
                : 'transparent',
            borderRadius: 'var(--ds-menu-border-radius, 6px)',
            transition: 'all 0.2s ease',
            outline: isFocused ? '2px solid var(--ds-menu-focus-ring, var(--ds-color-primary-500, #1677ff))' : 'none',
            outlineOffset: '-2px',
          }}
        >
          {item.icon && <span>{item.icon}</span>}
          <span>{item.label}</span>
        </div>
      </li>
    );
  });
}

// ============================================================================
// RusticMenu Component
// ============================================================================

/**
 * Pure HTML/CSS implementation of the Menu component.
 *
 * @description
 * Renders the Menu component without external UI framework dependencies,
 * providing maximum accessibility and customization potential.
 *
 * @remarks
 * - Zero external dependencies
 * - Full keyboard navigation support:
 *   - ArrowUp/ArrowDown: Navigate between items
 *   - Home/End: Jump to first/last item
 *   - Enter/Space: Select item or toggle submenu
 *   - Escape: Clear focus
 * - WCAG 2.1 AA compliant
 * - CSS variable-based theming
 * - Focus management with visual indicators
 *
 * @param props - {@link MenuProps}
 * @returns Rendered Rustic Menu component
 *
 * @example
 * ```tsx
 * <RusticMenu
 *   items={menuItems}
 *   mode="vertical"
 *   selectedKeys={['home']}
 *   onSelect={handleSelect}
 * />
 * ```
 */
export default function RusticMenu(props: MenuProps): React.ReactElement {
  const {
    items = [],
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
    inlineIndent = MENU_DEFAULTS.inlineIndent,
    theme = MENU_DEFAULTS.theme,
    children,
    className = '',
    style,
  } = props;

  // ========================================================================
  // Refs
  // ========================================================================

  /** Reference to the menu container for focus management */
  const menuRef = useRef<HTMLUListElement>(null);

  // ========================================================================
  // State Management
  // ========================================================================

  /** Internal state for uncontrolled selection mode */
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);

  /** Internal state for uncontrolled open keys mode */
  const [internalOpenKeys, setInternalOpenKeys] = useState<string[]>(defaultOpenKeys);

  /** Currently focused item key for keyboard navigation */
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  /** Use controlled or uncontrolled state */
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
  const openKeys = controlledOpenKeys ?? internalOpenKeys;

  /** Get all focusable keys for keyboard navigation */
  const focusableKeys = items ? getFocusableKeys(items) : [];

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles submenu toggle.
   * Expands or collapses a submenu.
   */
  const handleSubmenuToggle = useCallback(
    (key: string) => {
      const newOpenKeys = openKeys.includes(key)
        ? openKeys.filter((k) => k !== key)
        : [...openKeys, key];

      if (controlledOpenKeys === undefined) {
        setInternalOpenKeys(newOpenKeys);
      }

      onOpenChange?.(newOpenKeys);
    },
    [openKeys, controlledOpenKeys, onOpenChange]
  );

  /**
   * Handles menu item click events.
   * Manages selection state and triggers callbacks.
   */
  const handleItemClick = useCallback(
    (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => {
      // Call onClick callback
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
          // Toggle selection in multiple mode
          newSelectedKeys = selectedKeys.includes(key)
            ? selectedKeys.filter((k) => k !== key)
            : [...selectedKeys, key];
        } else {
          // Single selection
          newSelectedKeys = [key];
        }

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

  /**
   * Handles keyboard navigation.
   * Supports Arrow keys, Home, End, Enter, Space, and Escape.
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      if (focusableKeys.length === 0) return;

      const currentIndex = focusedKey ? focusableKeys.indexOf(focusedKey) : -1;
      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = currentIndex < focusableKeys.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableKeys.length - 1;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = focusableKeys.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedKey) {
            const item = items.find((i) => i.key === focusedKey);
            if (item?.children) {
              handleSubmenuToggle(focusedKey);
            } else {
              handleItemClick(focusedKey, [focusedKey], e as unknown as React.MouseEvent<HTMLElement>);
            }
          }
          return;
        case 'Escape':
          setFocusedKey(null);
          return;
        default:
          return;
      }

      if (nextIndex !== currentIndex && focusableKeys[nextIndex]) {
        setFocusedKey(focusableKeys[nextIndex]);
      }
    },
    [focusedKey, focusableKeys, items, handleSubmenuToggle, handleItemClick]
  );

  // ========================================================================
  // Effects
  // ========================================================================

  /**
   * Focus management effect.
   * Focuses the DOM element when focusedKey changes.
   */
  useEffect(() => {
    if (focusedKey && menuRef.current) {
      const element = menuRef.current.querySelector(`[data-key="${focusedKey}"]`) as HTMLElement;
      element?.focus();
    }
  }, [focusedKey]);

  // ========================================================================
  // Styles
  // ========================================================================

  /**
   * Menu container styles with CSS variables for theming.
   */
  const menuStyle: CSSProperties = {
    listStyle: 'none',
    padding: '4px',
    margin: 0,
    backgroundColor: theme === 'dark' ? 'var(--ds-menu-dark-bg, #001529)' : 'var(--ds-menu-bg, #fff)',
    color: theme === 'dark' ? 'var(--ds-menu-dark-item-color, rgba(255, 255, 255, 0.65))' : 'var(--ds-menu-item-color, rgba(0, 0, 0, 0.88))',
    borderRadius: 'var(--ds-menu-border-radius, 8px)',
    display: mode === 'horizontal' ? 'flex' : 'block',
    flexDirection: mode === 'horizontal' ? 'row' : undefined,
    width: inlineCollapsed && mode === 'inline' ? 'var(--ds-menu-collapsed-width, 80px)' : undefined,
    ...style,
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <ul
      ref={menuRef}
      className={`rottay-menu rottay-menu--rustic rottay-menu--${mode} rottay-menu--${theme} ${className}`}
      style={menuStyle}
      role="menu"
      aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        // Focus first item when menu receives focus
        if (!focusedKey && focusableKeys.length > 0) {
          setFocusedKey(focusableKeys[0]);
        }
      }}
      onBlur={(e) => {
        // Clear focus when leaving the menu
        if (!menuRef.current?.contains(e.relatedTarget as Node)) {
          setFocusedKey(null);
        }
      }}
    >
      {items && items.length > 0
        ? renderRusticMenuItems(items, handleItemClick, selectedKeys, focusedKey, openKeys, handleSubmenuToggle, inlineIndent)
        : children}
    </ul>
  );
}

RusticMenu.displayName = 'RusticMenu';
