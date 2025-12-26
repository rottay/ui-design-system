/**
 * Menu.Group - Compound Component
 * Groups menu items with a title
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { MenuGroupProps } from '../../types';

export function MenuGroup({
  title,
  children,
  className = '',
  style,
}: MenuGroupProps): React.ReactElement {
  const groupStyle: CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    ...style,
  };

  const titleStyle: CSSProperties = {
    padding: 'var(--menu-group-title-padding, 8px 16px 4px)',
    fontSize: 'var(--menu-group-title-font-size, 12px)',
    fontWeight: 'var(--menu-group-title-font-weight, 600)',
    color: 'var(--menu-group-title-color, rgba(0, 0, 0, 0.45))',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    userSelect: 'none',
  };

  const contentStyle: CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  return (
    <li
      className={`rottay-menu-group ${className}`}
      style={groupStyle}
      role="presentation"
    >
      <div
        className="rottay-menu-group__title"
        style={titleStyle}
        role="presentation"
      >
        {title}
      </div>
      <ul
        className="rottay-menu-group__content"
        style={contentStyle}
        role="group"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        {children}
      </ul>
    </li>
  );
}

MenuGroup.displayName = 'Menu.Group';
