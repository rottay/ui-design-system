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
    padding: `0 ${sizeValues.paddingX}`,
    fontSize: sizeValues.fontSize,
    backgroundColor: variant === 'transparent' ? 'transparent' : 'var(--ds-color-bg-secondary)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--ds-color-border-secondary)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 6,
    color: 'var(--ds-color-text-secondary)',
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
