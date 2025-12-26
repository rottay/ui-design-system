/**
 * Input.Addon - Compound Component
 * Addon element for input groups (before/after)
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { InputAddonProps } from '../../types';
import { SIZE_MAP } from '../../types';

export function InputAddon({
  children,
  position = 'before',
  size = 'md',
  variant = 'default',
  className = '',
  style,
}: InputAddonProps): React.ReactElement {
  const sizeValues = SIZE_MAP[size] || SIZE_MAP.md;

  const addonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: sizeValues.height,
    padding: `0 ${sizeValues.paddingX}px`,
    fontSize: sizeValues.fontSize,
    backgroundColor: variant === 'transparent' ? 'transparent' : '#fafafa',
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    color: 'rgba(0, 0, 0, 0.65)',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    ...style,
  };

  return (
    <span
      className={`rottay-input-addon rottay-input-addon--${position} ${className}`}
      style={addonStyle}
    >
      {children}
    </span>
  );
}

InputAddon.displayName = 'Input.Addon';
