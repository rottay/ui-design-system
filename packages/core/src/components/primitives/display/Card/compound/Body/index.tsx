/**
 * @fileoverview Card.Body Compound Component
 * @description Body/content section for Card component.
 * Provides consistent padding and layout for main card content.
 *
 * @module Card/compound/Body
 * @package @es-rottay/designsystem-core
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { CardBodyProps } from '../../types';

/**
 * Padding size to CSS value mapping.
 * @internal
 */
const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: '12px 16px',
  md: '16px 24px',
  lg: '24px 32px',
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
