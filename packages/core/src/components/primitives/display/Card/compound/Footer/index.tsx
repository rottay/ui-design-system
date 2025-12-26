/**
 * Card.Footer - Compound Component
 * Footer section for Card component
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { CardFooterProps } from '../../types';

const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: '12px 16px',
  md: '16px 24px',
  lg: '20px 32px',
};

const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
};

/**
 * Card footer with actions or additional content
 */
export function CardFooter({
  children,
  actions,
  divider = false,
  padding = 'md',
  align = 'end',
  className = '',
  style,
}: CardFooterProps): React.ReactElement {
  const footerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: ALIGN_MAP[align],
    gap: '8px',
    padding: PADDING_MAP[padding],
    borderTop: divider ? '1px solid var(--card-border-color, #f0f0f0)' : 'none',
    ...style,
  };

  return (
    <div className={`rottay-card-footer ${className}`} style={footerStyle}>
      {children}
      {actions && actions.length > 0 && (
        <div
          className="rottay-card-footer-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {actions.map((action, index) => (
            <React.Fragment key={index}>{action}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

CardFooter.displayName = 'Card.Footer';

export type { CardFooterProps };
