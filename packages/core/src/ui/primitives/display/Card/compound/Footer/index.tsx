/**
 * @fileoverview Card.Footer Compound - Rottay Design System
 * @description Action area for Card with flexible button layout.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The CardFooter provides a consistent action area for cards with
 * configurable alignment and optional divider.
 *
 * **Alignment Options:**
 * - `start` - Align to left
 * - `center` - Center alignment
 * - `end` - Align to right (default)
 * - `space-between` - Spread across
 *
 * **Content Sources:**
 * - `children` - Custom content
 * - `actions` - Array of action elements
 *
 * @example Actions Array
 * ```tsx
 * <Card.Footer actions={[
 *   <Button key="cancel">Cancel</Button>,
 *   <Button key="save" variant="primary">Save</Button>
 * ]} />
 * ```
 *
 * @example Custom Layout
 * ```tsx
 * <Card.Footer align="space-between" divider>
 *   <span>Last updated: Today</span>
 *   <Button>Edit</Button>
 * </Card.Footer>
 * ```
 *
 * @see {@link Card} for the main component
 * @module CardFooter
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { CardFooterProps } from '../../contracts';

/**
 * Padding size to CSS value mapping.
 * @internal
 */
const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: 'var(--ds-card-footer-padding-sm, var(--ds-spacing-3, 12px) var(--ds-spacing-4, 16px))',
  md: 'var(--ds-card-footer-padding, var(--ds-spacing-4, 16px) var(--ds-spacing-5, 20px))',
  lg: 'var(--ds-card-footer-padding-lg, var(--ds-spacing-5, 20px) var(--ds-spacing-6, 24px))',
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
  ...rest
}: CardFooterProps): React.ReactElement {
  const footerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: ALIGN_MAP[align],
    flexWrap: 'wrap',
    gap: 'var(--ds-card-footer-actions-gap, var(--ds-spacing-2, 8px))',
    padding: PADDING_MAP[padding],
    ...style,
  };

  return (
    <div {...rest} className={`rottay-card-footer ${className}`} data-part="footer" data-divider={divider ? 'true' : undefined} data-align={align} style={footerStyle}>
      {children}
      {actions && actions.length > 0 && (
        <div
          className="rottay-card-footer-actions"
          data-part="actions"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--ds-card-footer-actions-gap, var(--ds-spacing-2, 8px))',
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
