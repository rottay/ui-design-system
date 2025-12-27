/**
 * Alert.Description - Compound Component
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

export interface AlertDescriptionProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const AlertDescription = forwardRef<HTMLDivElement, AlertDescriptionProps>(
  (props, ref) => {
    const { children, className = '', style = {} } = props;

    const descriptionStyle: React.CSSProperties = {
      marginTop: '4px',
      fontSize: '14px',
      lineHeight: 1.6,
      opacity: 0.85,
      ...style,
    };

    return (
      <div ref={ref} className={`rottay-alert-description ${className}`} style={descriptionStyle}>
        {children}
      </div>
    );
  }
);

AlertDescription.displayName = 'Alert.Description';

export default AlertDescription;
