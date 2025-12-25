/**
 * Card.Footer - Compound Component
 * Footer section for Card component
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Card footer with actions or additional content
 */
export function CardFooter({
  children,
  className = '',
  style,
}: CardFooterProps): React.ReactElement {
  const footerStyle: CSSProperties = {
    padding: 'var(--card-footer-padding, 16px 24px)',
    borderTop: '1px solid var(--card-border-color, #f0f0f0)',
    ...style,
  };

  return (
    <div className={`rottay-card-footer ${className}`} style={footerStyle}>
      {children}
    </div>
  );
}

CardFooter.displayName = 'Card.Footer';
