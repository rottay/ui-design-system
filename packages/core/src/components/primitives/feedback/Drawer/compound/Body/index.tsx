/**
 * Drawer.Body - Compound Component
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

export interface DrawerBodyProps {
  children?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: '12px',
  md: '16px',
  lg: '24px',
};

export const DrawerBody = forwardRef<HTMLDivElement, DrawerBodyProps>(
  (props, ref) => {
    const {
      children,
      padding = 'lg',
      className = '',
      style = {},
    } = props;

    const bodyStyle: React.CSSProperties = {
      flex: 1,
      padding: PADDING_MAP[padding] || PADDING_MAP.lg,
      overflowY: 'auto',
      overflowX: 'hidden',
      ...style,
    };

    return (
      <div ref={ref} className={`rottay-drawer-body ${className}`} style={bodyStyle}>
        {children}
      </div>
    );
  }
);

DrawerBody.displayName = 'Drawer.Body';

export default DrawerBody;
