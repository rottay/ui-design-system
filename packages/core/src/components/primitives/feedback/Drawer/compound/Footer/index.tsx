/**
 * Drawer.Footer - Compound Component
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

export interface DrawerFooterProps {
  children?: ReactNode;
  divider?: boolean;
  align?: 'start' | 'center' | 'end' | 'space-between';
  className?: string;
  style?: React.CSSProperties;
}

export const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(
  (props, ref) => {
    const {
      children,
      divider = false,
      align = 'end',
      className = '',
      style = {},
    } = props;

    const alignMap: Record<string, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      'space-between': 'space-between',
    };

    const footerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: alignMap[align] || 'flex-end',
      gap: '12px',
      padding: '16px 24px',
      borderTop: divider ? '1px solid var(--drawer-footer-border, rgba(0, 0, 0, 0.1))' : 'none',
      flexShrink: 0,
      ...style,
    };

    return (
      <div ref={ref} className={`rottay-drawer-footer ${className}`} style={footerStyle}>
        {children}
      </div>
    );
  }
);

DrawerFooter.displayName = 'Drawer.Footer';

export default DrawerFooter;
