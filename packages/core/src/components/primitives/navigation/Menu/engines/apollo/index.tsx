/**
 * Menu - Apollo Engine (Pure HTML/CSS with full keyboard navigation)
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import type { MenuProps, MenuItem as MenuItemInterface, MenuSelectInfo, MenuClickInfo } from '../../types';
import { MENU_DEFAULTS } from '../../types';

/**
 * Get all focusable menu item keys
 */
function getFocusableKeys(items: MenuItemInterface[]): string[] {
  const keys: string[] = [];

  items.forEach((item) => {
    if (item.type === 'divider') return;
    if (item.disabled) return;

    if (item.children && item.children.length > 0) {
      keys.push(item.key);
      keys.push(...getFocusableKeys(item.children));
    } else if (item.type !== 'group') {
      keys.push(item.key);
    } else if (item.children) {
      keys.push(...getFocusableKeys(item.children));
    }
  });

  return keys;
}

/**
 * Render Apollo menu items recursively
 */
function renderApolloMenuItems(
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

    // Handle divider
    if (item.type === 'divider') {
      return (
        <li
          key={item.key}
          role="separator"
          style={{
            height: '1px',
            margin: '8px 0',
            backgroundColor: 'var(--menu-divider-color, rgba(0, 0, 0, 0.06))',
          }}
        />
      );
    }

    // Handle group
    if (item.type === 'group') {
      return (
        <li key={item.key} role="presentation">
          <div
            style={{
              padding: '8px 16px 4px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--menu-group-title-color, rgba(0, 0, 0, 0.45))',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              paddingLeft: paddingLeft ? `${paddingLeft}px` : undefined,
            }}
          >
            {item.title || item.label}
          </div>
          {item.children && (
            <ul role="group" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {renderApolloMenuItems(
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

    // Handle submenu (has children)
    if (item.children && item.children.length > 0) {
      const isOpen = openKeys.includes(item.key);
      const isFocused = focusedKey === item.key;

      return (
        <li key={item.key} role="presentation">
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
              color: 'var(--menu-item-color, inherit)',
              backgroundColor: isFocused ? 'var(--menu-item-hover-bg, rgba(0, 0, 0, 0.04))' : 'transparent',
              borderRadius: 'var(--menu-border-radius, 6px)',
              transition: 'all 0.2s ease',
              outline: isFocused ? '2px solid var(--menu-focus-ring, #1677ff)' : 'none',
              outlineOffset: '-2px',
            }}
          >
            {item.icon && <span>{item.icon}</span>}
            <span style={{ flex: 1 }}>{item.label}</span>
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
            {renderApolloMenuItems(
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

    // Handle regular item
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
              ? 'var(--menu-item-danger-color, #ff4d4f)'
              : isSelected
                ? 'var(--menu-item-selected-color, #1677ff)'
                : 'var(--menu-item-color, inherit)',
            backgroundColor: isSelected
              ? 'var(--menu-item-selected-bg, rgba(22, 119, 255, 0.08))'
              : isFocused
                ? 'var(--menu-item-hover-bg, rgba(0, 0, 0, 0.04))'
                : 'transparent',
            borderRadius: 'var(--menu-border-radius, 6px)',
            transition: 'all 0.2s ease',
            outline: isFocused ? '2px solid var(--menu-focus-ring, #1677ff)' : 'none',
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

export default function ApolloMenu(props: MenuProps): React.ReactElement {
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

  const menuRef = useRef<HTMLUListElement>(null);

  // Internal state for uncontrolled mode
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);
  const [internalOpenKeys, setInternalOpenKeys] = useState<string[]>(defaultOpenKeys);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  // Use controlled or uncontrolled state
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
  const openKeys = controlledOpenKeys ?? internalOpenKeys;

  // Get all focusable keys
  const focusableKeys = items ? getFocusableKeys(items) : [];

  // Handle submenu toggle
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

  // Handle item click
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
          newSelectedKeys = selectedKeys.includes(key)
            ? selectedKeys.filter((k) => k !== key)
            : [...selectedKeys, key];
        } else {
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

  // Handle keyboard navigation
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

  // Focus management
  useEffect(() => {
    if (focusedKey && menuRef.current) {
      const element = menuRef.current.querySelector(`[data-key="${focusedKey}"]`) as HTMLElement;
      element?.focus();
    }
  }, [focusedKey]);

  const menuStyle: CSSProperties = {
    listStyle: 'none',
    padding: '4px',
    margin: 0,
    backgroundColor: theme === 'dark' ? 'var(--menu-dark-bg, #001529)' : 'var(--menu-bg, #fff)',
    color: theme === 'dark' ? 'var(--menu-dark-item-color, rgba(255, 255, 255, 0.65))' : 'var(--menu-item-color, rgba(0, 0, 0, 0.88))',
    borderRadius: 'var(--menu-border-radius, 8px)',
    display: mode === 'horizontal' ? 'flex' : 'block',
    flexDirection: mode === 'horizontal' ? 'row' : undefined,
    width: inlineCollapsed && mode === 'inline' ? 'var(--menu-collapsed-width, 80px)' : undefined,
    ...style,
  };

  return (
    <ul
      ref={menuRef}
      className={`rottay-menu rottay-menu--apollo rottay-menu--${mode} rottay-menu--${theme} ${className}`}
      style={menuStyle}
      role="menu"
      aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        if (!focusedKey && focusableKeys.length > 0) {
          setFocusedKey(focusableKeys[0]);
        }
      }}
      onBlur={(e) => {
        if (!menuRef.current?.contains(e.relatedTarget as Node)) {
          setFocusedKey(null);
        }
      }}
    >
      {items && items.length > 0
        ? renderApolloMenuItems(items, handleItemClick, selectedKeys, focusedKey, openKeys, handleSubmenuToggle, inlineIndent)
        : children}
    </ul>
  );
}

ApolloMenu.displayName = 'ApolloMenu';
