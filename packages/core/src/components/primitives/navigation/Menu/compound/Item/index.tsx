/**
 * Menu.Item - Compound Component
 * Individual menu item
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { MenuItemProps } from '../../types';

export function MenuItem({
  itemKey,
  icon,
  disabled = false,
  danger = false,
  onClick,
  title,
  children,
  className = '',
  style,
}: MenuItemProps): React.ReactElement {
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLElement>);
    }
  };

  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--menu-item-gap, 8px)',
    padding: 'var(--menu-item-padding, 8px 16px)',
    minHeight: 'var(--menu-item-height, 40px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    color: danger
      ? 'var(--menu-item-danger-color, #ff4d4f)'
      : 'var(--menu-item-color, inherit)',
    backgroundColor: 'transparent',
    borderRadius: 'var(--menu-border-radius, 6px)',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    ...style,
  };

  return (
    <li
      className={`rottay-menu-item ${disabled ? 'rottay-menu-item--disabled' : ''} ${danger ? 'rottay-menu-item--danger' : ''} ${className}`}
      style={itemStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      title={title}
      data-key={itemKey}
    >
      {icon && <span className="rottay-menu-item__icon">{icon}</span>}
      <span className="rottay-menu-item__label">{children}</span>
    </li>
  );
}

MenuItem.displayName = 'Menu.Item';
