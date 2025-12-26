/**
 * Menu - Hermes Engine (DaisyUI)
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { MenuProps, MenuItem as MenuItemInterface, MenuSelectInfo, MenuClickInfo } from '../../types';
import { MENU_DEFAULTS } from '../../types';

/**
 * Render DaisyUI menu items recursively
 */
function renderDaisyMenuItems(
  items: MenuItemInterface[],
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void,
  selectedKeys: string[],
  level: number = 0
): React.ReactNode {
  return items.map((item) => {
    // Handle divider
    if (item.type === 'divider') {
      return <li key={item.key} className="divider" />;
    }

    // Handle group
    if (item.type === 'group') {
      return (
        <li key={item.key} className="menu-title">
          <span>{item.title || item.label}</span>
          {item.children && (
            <ul>
              {renderDaisyMenuItems(item.children, onItemClick, selectedKeys, level + 1)}
            </ul>
          )}
        </li>
      );
    }

    // Handle submenu (has children)
    if (item.children && item.children.length > 0) {
      return (
        <li key={item.key}>
          <details>
            <summary className={item.disabled ? 'disabled' : ''}>
              {item.icon && <span className="menu-icon">{item.icon}</span>}
              {item.label}
            </summary>
            <ul>
              {renderDaisyMenuItems(item.children, onItemClick, selectedKeys, level + 1)}
            </ul>
          </details>
        </li>
      );
    }

    // Handle regular item
    const isSelected = selectedKeys.includes(item.key);
    const itemClasses = [
      item.disabled ? 'disabled' : '',
      item.danger ? 'text-error' : '',
      isSelected ? 'active' : '',
    ].filter(Boolean).join(' ');

    return (
      <li key={item.key}>
        <a
          className={itemClasses}
          onClick={(e) => {
            e.preventDefault();
            if (!item.disabled) {
              onItemClick(item.key, [item.key], e as React.MouseEvent<HTMLElement>);
            }
          }}
          aria-disabled={item.disabled}
        >
          {item.icon && <span className="menu-icon">{item.icon}</span>}
          {item.label}
        </a>
      </li>
    );
  });
}

export default function HermesMenu(props: MenuProps): React.ReactElement {
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

  // Internal state for uncontrolled mode
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);

  // Use controlled or uncontrolled state
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

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

        // Update internal state if uncontrolled
        if (controlledSelectedKeys === undefined) {
          setInternalSelectedKeys(newSelectedKeys);
        }

        // Call onSelect callback
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

  // DaisyUI menu classes
  const menuClasses = [
    'menu',
    mode === 'horizontal' ? 'menu-horizontal' : 'menu-vertical',
    inlineCollapsed ? 'menu-compact' : '',
    theme === 'dark' ? 'bg-base-300' : 'bg-base-100',
    'rounded-box',
    className,
  ].filter(Boolean).join(' ');

  const menuStyle: CSSProperties = {
    ...style,
  };

  return (
    <ul
      className={`rottay-menu rottay-menu--hermes ${menuClasses}`}
      style={menuStyle}
      role="menu"
    >
      {items
        ? renderDaisyMenuItems(items, handleItemClick, selectedKeys)
        : children}
    </ul>
  );
}

HermesMenu.displayName = 'HermesMenu';
