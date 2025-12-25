/**
 * Hermes Menu Engine
 *
 * DaisyUI menu implementation with unified MenuProps.
 */

'use client';

import { useState } from 'react';
import type { MenuProps, MenuItem, MenuInfo } from '../../../../types/components/menu';

interface MenuItemComponentProps {
  item: MenuItem;
  level: number;
  selectedKeys: string[];
  openKeys: string[];
  mode: 'vertical' | 'horizontal' | 'inline';
  onSelect: (info: MenuInfo) => void;
  onClick: (info: MenuInfo) => void;
  onOpenChange: (key: string, open: boolean) => void;
}

/**
 * Recursive menu item component for DaisyUI
 */
function MenuItemComponent({
  item,
  level,
  selectedKeys,
  openKeys,
  mode,
  onSelect,
  onClick,
  onOpenChange,
}: MenuItemComponentProps) {
  const isSelected = selectedKeys.includes(item.key);
  const isOpen = openKeys.includes(item.key);
  const hasChildren = item.children && item.children.length > 0;

  // Handle divider
  if (item.type === 'divider') {
    return <li className="divider"></li>;
  }

  // Handle group (DaisyUI uses menu-title)
  if (item.type === 'group') {
    return (
      <>
        <li className="menu-title">{item.label}</li>
        {item.children &&
          item.children.map((child) => (
            <MenuItemComponent
              key={child.key}
              item={child}
              level={level}
              selectedKeys={selectedKeys}
              openKeys={openKeys}
              mode={mode}
              onSelect={onSelect}
              onClick={onClick}
              onOpenChange={onOpenChange}
            />
          ))}
      </>
    );
  }

  const handleClick = (event: React.MouseEvent | React.KeyboardEvent) => {
    if (item.disabled) return;

    const menuInfo: MenuInfo = {
      key: item.key,
      keyPath: [item.key],
      item,
      domEvent: event,
    };

    onClick(menuInfo);

    if (!hasChildren) {
      onSelect(menuInfo);
    } else {
      // Toggle submenu
      onOpenChange(item.key, !isOpen);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }
  };

  // No children - regular menu item
  if (!hasChildren) {
    return (
      <li>
        <a
          role="menuitem"
          aria-label={item['aria-label'] ?? (typeof item.label === 'string' ? item.label : undefined)}
          aria-disabled={item.disabled}
          tabIndex={item.disabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`${isSelected ? 'active' : ''} ${item.disabled ? 'disabled' : ''} ${
            item.danger ? 'text-error' : ''
          }`}
          title={item.title}
        >
          {item.icon && <span>{item.icon}</span>}
          <span>{item.label}</span>
        </a>
      </li>
    );
  }

  // Has children - submenu
  return (
    <li>
      <details open={isOpen}>
        <summary
          role="menuitem"
          aria-label={item['aria-label'] ?? (typeof item.label === 'string' ? item.label : undefined)}
          aria-disabled={item.disabled}
          aria-expanded={isOpen}
          tabIndex={item.disabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`${isSelected ? 'active' : ''} ${item.disabled ? 'disabled' : ''} ${
            item.danger ? 'text-error' : ''
          }`}
          title={item.title}
        >
          {item.icon && <span>{item.icon}</span>}
          <span>{item.label}</span>
        </summary>
        <ul>
          {item.children?.map((child) => (
            <MenuItemComponent
              key={child.key}
              item={child}
              level={level + 1}
              selectedKeys={selectedKeys}
              openKeys={openKeys}
              mode={mode}
              onSelect={onSelect}
              onClick={onClick}
              onOpenChange={onOpenChange}
            />
          ))}
        </ul>
      </details>
    </li>
  );
}

/**
 * Hermes Menu - DaisyUI implementation with unified MenuProps
 */
function HermesMenu({
  items = [],
  selectedKeys: controlledSelectedKeys,
  defaultSelectedKeys = [],
  openKeys: controlledOpenKeys,
  defaultOpenKeys = [],
  onSelect,
  onClick,
  onOpenChange,
  className = '',
  style,
  id,
  mode = 'vertical',
  selectable = true,
  multiple = false,
  inlineCollapsed = false,
  keyboard = true,
  'aria-label': ariaLabel,
}: MenuProps) {
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);
  const [internalOpenKeys, setInternalOpenKeys] = useState<string[]>(defaultOpenKeys);

  const isControlledSelection = controlledSelectedKeys !== undefined;
  const isControlledOpen = controlledOpenKeys !== undefined;

  const currentSelectedKeys = isControlledSelection
    ? controlledSelectedKeys
    : internalSelectedKeys;
  const currentOpenKeys = isControlledOpen ? controlledOpenKeys : internalOpenKeys;

  const handleSelect = (info: MenuInfo) => {
    if (!selectable) return;

    if (!isControlledSelection) {
      if (multiple) {
        // Toggle selection for multiple mode
        const newKeys = currentSelectedKeys.includes(info.key)
          ? currentSelectedKeys.filter((k) => k !== info.key)
          : [...currentSelectedKeys, info.key];
        setInternalSelectedKeys(newKeys);
      } else {
        // Single selection
        setInternalSelectedKeys([info.key]);
      }
    }

    onSelect?.(info);
  };

  const handleClick = (info: MenuInfo) => {
    onClick?.(info);
  };

  const handleOpenChange = (key: string, open: boolean) => {
    if (!isControlledOpen) {
      const newOpenKeys = open
        ? [...currentOpenKeys, key]
        : currentOpenKeys.filter((k) => k !== key);
      setInternalOpenKeys(newOpenKeys);
    }

    onOpenChange?.(open ? [...currentOpenKeys, key] : currentOpenKeys.filter((k) => k !== key));
  };

  // DaisyUI menu classes
  const menuClasses = [
    'menu',
    mode === 'horizontal' ? 'menu-horizontal' : 'menu-vertical',
    inlineCollapsed ? 'menu-compact' : '',
    'bg-base-200',
    'rounded-box',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ul
      className={menuClasses}
      style={style}
      id={id}
      role="menu"
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <MenuItemComponent
          key={item.key}
          item={item}
          level={0}
          selectedKeys={currentSelectedKeys}
          openKeys={currentOpenKeys}
          mode={mode}
          onSelect={handleSelect}
          onClick={handleClick}
          onOpenChange={handleOpenChange}
        />
      ))}
    </ul>
  );
}

HermesMenu.displayName = 'HermesMenu';

export default HermesMenu;
