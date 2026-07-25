/**
 * @fileoverview Card.Body Compound - Rottay Design System
 * @description Main content area for Card with configurable padding.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The CardBody provides a flexible content container that fills
 * available vertical space with consistent padding options.
 *
 * **Padding Options:**
 * - `none` - No padding (0)
 * - `sm` - Small padding (12px 16px)
 * - `md` - Medium padding (16px 24px) - default
 * - `lg` - Large padding (24px 32px)
 *
 * @example Basic Body
 * ```tsx
 * <Card.Body>
 *   <p>Main content goes here</p>
 * </Card.Body>
 * ```
 *
 * @example Edge-to-Edge Content
 * ```tsx
 * <Card.Body padding="none">
 *   <Image src="/full-width.jpg" />
 * </Card.Body>
 * ```
 *
 * @see {@link Card} for the main component
 * @module CardBody
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { CardBodyProps } from '../../contracts';

/**
 * Padding size to CSS value mapping.
 * @internal
 */
const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: 'var(--ds-card-body-padding-sm, var(--ds-spacing-3, 12px) var(--ds-spacing-4, 16px))',
  md: 'var(--ds-card-body-padding, var(--ds-spacing-4, 16px) var(--ds-spacing-5, 20px))',
  lg: 'var(--ds-card-body-padding-lg, var(--ds-spacing-5, 20px) var(--ds-spacing-6, 24px))',
};

/**
 * Card body compound component.
 * Container for the main content of a card.
 *
 * Features:
 * - Flexible content container with configurable padding
 * - Automatically fills available vertical space
 * - Maintains consistent spacing with other card sections
 *
 * @component
 * @example
 * // Basic usage
 * <Card.Body>
 *   <p>Main content goes here</p>
 * </Card.Body>
 *
 * @example
 * // With custom padding
 * <Card.Body padding="lg">
 *   <p>Content with larger padding</p>
 * </Card.Body>
 *
 * @example
 * // No padding for edge-to-edge content
 * <Card.Body padding="none">
 *   <Image src="/photo.jpg" alt="Full width image" />
 * </Card.Body>
 *
 * @param {CardBodyProps} props - Component properties
 * @returns {React.ReactElement} The rendered CardBody component
 */
export function CardBody({
  children,
  padding = 'md',
  className = '',
  style,
  ...rest
}: CardBodyProps): React.ReactElement {
  const bodyStyle: CSSProperties = {
    padding: PADDING_MAP[padding],
    flex: 1,
    ...style,
  };
  const renderedChildren = React.Children.toArray(children);

  return (
    <div {...rest} className={`rottay-card-body ${className}`} data-part="body" style={bodyStyle}>
      {renderedChildren}
    </div>
  );
}

CardBody.displayName = 'Card.Body';

export type { CardBodyProps };
