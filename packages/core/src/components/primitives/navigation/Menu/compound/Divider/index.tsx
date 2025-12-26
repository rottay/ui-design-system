/**
 * Menu.Divider - Compound Component
 * Visual separator between menu items
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { MenuDividerProps } from '../../types';

export function MenuDivider({
  dashed = false,
  className = '',
  style,
}: MenuDividerProps): React.ReactElement {
  const dividerStyle: CSSProperties = {
    height: '1px',
    margin: 'var(--menu-divider-margin, 8px 0)',
    backgroundColor: 'var(--menu-divider-color, rgba(0, 0, 0, 0.06))',
    borderStyle: dashed ? 'dashed' : 'solid',
    borderWidth: dashed ? '1px 0 0 0' : 0,
    borderColor: dashed ? 'var(--menu-divider-color, rgba(0, 0, 0, 0.06))' : 'transparent',
    ...style,
  };

  return (
    <li
      className={`rottay-menu-divider ${dashed ? 'rottay-menu-divider--dashed' : ''} ${className}`}
      style={dividerStyle}
      role="separator"
    />
  );
}

MenuDivider.displayName = 'Menu.Divider';
