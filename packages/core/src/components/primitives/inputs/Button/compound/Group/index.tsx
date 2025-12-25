/**
 * Button.Group - Compound Component
 * Groups multiple buttons together with consistent spacing
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

export interface ButtonGroupProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * ButtonGroup component for grouping multiple buttons
 */
export function ButtonGroup({
  children,
  orientation = 'horizontal',
  spacing = 8,
  className = '',
  style,
}: ButtonGroupProps): React.ReactElement {
  const groupStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: `${spacing}px`,
    ...style,
  };

  return (
    <div className={`rottay-button-group ${className}`} style={groupStyle} role="group">
      {children}
    </div>
  );
}

ButtonGroup.displayName = 'Button.Group';
