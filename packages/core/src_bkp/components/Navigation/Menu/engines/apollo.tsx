/**
 * Apollo Menu Engine
 *
 * Native HTML + Tailwind CSS menu implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState } from 'react';
import type { MenuProps, MenuItem, MenuInfo } from '../../../../types/components/menu';
import { cn } from '../../../../utils/cn';

const modeStyles = {
  vertical: {
    container: 'flex flex-col',
    item: 'w-full',
  },
  horizontal: {
    container: 'flex flex-row border-b border-gray-200',
    item: 'flex-shrink-0',
  },
  inline: {
    container: 'flex flex-col',
    item: 'w-full',
  },
};

const themeStyles = {
  light: {
    container: 'bg-white text-gray-900',
    item: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
    activeItem: 'text-blue-600 bg-blue-50',
    submenu: 'bg-gray-50',
  },
  dark: {
    container: 'bg-gray-800 text-white',
    item: 'text-gray-300 hover:text-white hover:bg-gray-700',
    activeItem: 'text-white bg-blue-600',
    submenu: 'bg-gray-900',
  },
};

interface MenuItemComponentProps {
  item: MenuItem;
  level: number;
  selectedKeys: string[];
  openKeys: string[];
  mode: 'vertical' | 'horizontal' | 'inline';
  theme: 'light' | 'dark';
  inlineIndent: number;
  inlineCollapsed: boolean;
  onSelect: (info: MenuInfo) => void;
  onClick: (info: MenuInfo) => void;
  onOpenChange: (key: string, open: boolean) => void;
}

/**
 * Recursive menu item component
 */
function MenuItemComponent({
  item,
  level,
  selectedKeys,
  openKeys,
  mode,
  theme,
  inlineIndent,
  inlineCollapsed,
  onSelect,
  onClick,
  onOpenChange,
}: MenuItemComponentProps) {
  const isSelected = selectedKeys.includes(item.key);
  const isOpen = openKeys.includes(item.key);
  const hasChildren = item.children && item.children.length > 0;
  const styles = themeStyles[theme];

  // Handle divider
  if (item.type === 'divider') {
    return <div className="border-t border-gray-200 my-1" />;
  }

  // Handle group
  if (item.type === 'group') {
    return (
      <div className="my-2">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {item.label}
        </div>
        {item.children && (
          <div>
            {item.children.map((child) => (
              <MenuItemComponent
                key={child.key}
                item={child}
                level={level}
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                mode={mode}
                theme={theme}
                inlineIndent={inlineIndent}
                inlineCollapsed={inlineCollapsed}
                onSelect={onSelect}
                onClick={onClick}
                onOpenChange={onOpenChange}
              />
            ))}
          </div>
        )}
      </div>
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

  const indentStyle =
    mode === 'inline' && !inlineCollapsed ? { paddingLeft: `${level * inlineIndent}px` } : {};

  return (
    <div>
      {/* Menu item */}
      <button
        type="button"
        role="menuitem"
        aria-label={item['aria-label'] ?? (typeof item.label === 'string' ? item.label : undefined)}
        aria-disabled={item.disabled}
        aria-expanded={hasChildren ? isOpen : undefined}
        tabIndex={item.disabled ? -1 : 0}
        disabled={item.disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
          styles.item,
          isSelected && styles.activeItem,
          item.disabled && 'opacity-50 cursor-not-allowed',
          !item.disabled && 'cursor-pointer',
          item.danger && 'text-red-600 hover:text-red-700 hover:bg-red-50'
        )}
        style={indentStyle}
        title={item.title}
      >
        {/* Icon */}
        {item.icon && !inlineCollapsed && <span className="flex-shrink-0">{item.icon}</span>}

        {/* Label */}
        {!inlineCollapsed && <span className="flex-1 text-left">{item.label}</span>}

        {/* Collapsed mode: show only icon */}
        {inlineCollapsed && item.icon && <span className="flex-shrink-0">{item.icon}</span>}

        {/* Submenu indicator */}
        {hasChildren && !inlineCollapsed && (
          <svg
            className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-90')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Submenu */}
      {hasChildren && isOpen && !inlineCollapsed && (
        <div className={cn(styles.submenu)}>
          {item.children?.map((child) => (
            <MenuItemComponent
              key={child.key}
              item={child}
              level={level + 1}
              selectedKeys={selectedKeys}
              openKeys={openKeys}
              mode={mode}
              theme={theme}
              inlineIndent={inlineIndent}
              inlineCollapsed={inlineCollapsed}
              onSelect={onSelect}
              onClick={onClick}
              onOpenChange={onOpenChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Apollo Menu - Native HTML + Tailwind implementation
 */
function ApolloMenu({
  items = [],
  selectedKeys: controlledSelectedKeys,
  defaultSelectedKeys = [],
  openKeys: controlledOpenKeys,
  defaultOpenKeys = [],
  onSelect,
  onClick,
  onOpenChange,
  className,
  style,
  id,
  mode = 'vertical',
  theme = 'light',
  selectable = true,
  multiple = false,
  inlineCollapsed = false,
  inlineIndent = 24,
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

  const modeStyle = modeStyles[mode];
  const themeStyle = themeStyles[theme];

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

  return (
    <nav
      className={cn('select-none', modeStyle.container, themeStyle.container, className)}
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
          theme={theme}
          inlineIndent={inlineIndent}
          inlineCollapsed={inlineCollapsed}
          onSelect={handleSelect}
          onClick={handleClick}
          onOpenChange={handleOpenChange}
        />
      ))}
    </nav>
  );
}

ApolloMenu.displayName = 'ApolloMenu';

export default ApolloMenu;
