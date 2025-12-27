/**
 * Drawer.Header - Compound Component
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

export interface DrawerHeaderProps {
  children?: ReactNode;
  divider?: boolean;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(
  (props, ref) => {
    const {
      children,
      divider = false,
      closable = true,
      onClose,
      className = '',
      style = {},
    } = props;

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '16px 24px',
      borderBottom: divider ? '1px solid var(--drawer-header-border, rgba(0, 0, 0, 0.1))' : 'none',
      flexShrink: 0,
      ...style,
    };

    const titleStyle: React.CSSProperties = {
      flex: 1,
      margin: 0,
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: 1.4,
    };

    return (
      <div ref={ref} className={`rottay-drawer-header ${className}`} style={headerStyle}>
        <div style={titleStyle}>{children}</div>
        {closable && onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '18px',
              lineHeight: 1,
            }}
            aria-label="Close drawer"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

DrawerHeader.displayName = 'Drawer.Header';

export default DrawerHeader;
