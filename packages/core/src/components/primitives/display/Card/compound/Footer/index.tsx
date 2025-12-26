/**
 * @fileoverview Card.Footer Compound Component
 * @description Footer section for Card component with actions and additional content.
 * Provides consistent layout for card actions and supplementary information.
 *
 * @module Card/compound/Footer
 * @package @es-rottay/designsystem-core
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { CardFooterProps } from '../../types';

/**
 * Padding size to CSS value mapping.
 * @internal
 */
const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: '12px 16px',
  md: '16px 24px',
  lg: '20px 32px',
};

/**
 * Alignment value to CSS flexbox value mapping.
 * @internal
 */
const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
};

/**
 * Card footer compound component.
 * Container for card actions and footer content.
 *
 * Features:
 * - Flexible action button layout
 * - Configurable content alignment
 * - Optional divider above the footer
 * - Supports both children and actions array
 *
 * @component
 * @example
 * // Basic usage with actions array
 * <Card.Footer actions={[
 *   <Button key="cancel">Cancel</Button>,
 *   <Button key="save" variant="primary">Save</Button>
 * ]} />
 *
 * @example
 * // With custom children and alignment
 * <Card.Footer align="space-between" divider>
 *   <span>Last updated: Today</span>
 *   <Button>Edit</Button>
 * </Card.Footer>
 *
 * @example
 * // Combined children and actions
 * <Card.Footer
 *   actions={[<Button key="action">Action</Button>]}
 *   align="start"
 * >
 *   <span>Status: Active</span>
 * </Card.Footer>
 *
 * @param {CardFooterProps} props - Component properties
 * @returns {React.ReactElement} The rendered CardFooter component
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
