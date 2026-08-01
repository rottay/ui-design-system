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
import type { CardFooterProps } from '../../contracts';

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
 * Layout (flex posture, `data-align` justification, per-`data-padding` inset)
 * and paint are owned by `presentation/components/skin/card-compounds.css`;
 * only a caller's own `style` prop stays inline.
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
  return (
    <div {...rest} className={`rottay-card-footer ${className}`} data-part="footer" data-divider={divider ? 'true' : undefined} data-padding={padding} data-align={align} style={style}>
      {children}
      {actions && actions.length > 0 && (
        <div
          className="rottay-card-footer-actions"
          data-part="actions"
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
