/**
 * Card.Body - Compound Component
 * Body section for Card component
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Card body content area
 */
export function CardBody({
  children,
  className = '',
  style,
}: CardBodyProps): React.ReactElement {
  const bodyStyle: CSSProperties = {
    padding: 'var(--card-body-padding, 24px)',
    ...style,
  };

  return (
    <div className={`rottay-card-body ${className}`} style={bodyStyle}>
      {children}
    </div>
  );
}

CardBody.displayName = 'Card.Body';
