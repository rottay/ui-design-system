/**
 * Card.Body - Compound Component
 * Body section for Card component
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { CardBodyProps } from '../../types';

const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: '12px 16px',
  md: '16px 24px',
  lg: '24px 32px',
};

/**
 * Card body content area
 */
export function CardBody({
  children,
  padding = 'md',
  className = '',
  style,
}: CardBodyProps): React.ReactElement {
  const bodyStyle: CSSProperties = {
    padding: PADDING_MAP[padding],
    flex: 1,
    ...style,
  };

  return (
    <div className={`rottay-card-body ${className}`} style={bodyStyle}>
      {children}
    </div>
  );
}

CardBody.displayName = 'Card.Body';

export type { CardBodyProps };
