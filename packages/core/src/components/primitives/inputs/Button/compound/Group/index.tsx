/**
 * @fileoverview ButtonGroup - Rottay Design System
 * @description Compound component for grouping multiple buttons together.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * ButtonGroup provides a way to visually and semantically group related buttons.
 * It supports both horizontal and vertical orientations, with options for
 * connected styling (no gaps) or spaced buttons.
 *
 * **Key Features:**
 * - Horizontal or vertical orientation
 * - Connected mode for toolbar-style button groups
 * - Configurable spacing between buttons
 * - Automatic border radius adjustment for connected buttons
 * - Props cascade to child buttons (size, variant, shape)
 *
 * **Accessibility:**
 * - Uses `role="group"` for semantic grouping
 * - Connected buttons maintain proper focus order
 *
 * @example Basic Button Group
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * <Button.Group>
 *   <Button variant="outline">Left</Button>
 *   <Button variant="outline">Center</Button>
 *   <Button variant="outline">Right</Button>
 * </Button.Group>
 * ```
 *
 * @example Connected Toolbar Style
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * <Button.Group connected orientation="horizontal">
 *   <Button variant="secondary">Bold</Button>
 *   <Button variant="secondary">Italic</Button>
 *   <Button variant="secondary">Underline</Button>
 * </Button.Group>
 * ```
 *
 * @example Vertical Group with Shared Size
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * <Button.Group orientation="vertical" size="sm" spacing={4}>
 *   <Button>Option 1</Button>
 *   <Button>Option 2</Button>
 *   <Button>Option 3</Button>
 * </Button.Group>
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link ButtonIcon} for icon-only buttons
 * @module ButtonGroup
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';
import type { ButtonSize, ButtonVariant, ButtonShape } from '../../types';

export interface ButtonGroupProps {
  /** Group children (Button components) */
  children: ReactNode;
  /** Group orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Whether buttons are connected (no gap) */
  connected?: boolean;
  /** Spacing between buttons (ignored if connected) */
  spacing?: number;
  /** Size applied to all buttons in group */
  size?: ButtonSize;
  /** Variant applied to all buttons in group */
  variant?: ButtonVariant;
  /** Shape applied to all buttons in group */
  shape?: ButtonShape;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * ButtonGroup component for grouping multiple buttons
 */
export function ButtonGroup({
  children,
  orientation = 'horizontal',
  connected = false,
  spacing = 8,
  size,
  variant,
  shape,
  className = '',
  style,
}: ButtonGroupProps): React.ReactElement {
  const groupStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: connected ? '0' : `${spacing}px`,
    ...style,
  };

  // Clone children to pass down size/variant/shape if provided
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    const isFirst = index === 0;
    const isLast = index === React.Children.count(children) - 1;

    // Connected button styles
    const connectedStyle: CSSProperties = connected ? {
      borderRadius: orientation === 'horizontal'
        ? isFirst ? '6px 0 0 6px' : isLast ? '0 6px 6px 0' : '0'
        : isFirst ? '6px 6px 0 0' : isLast ? '0 0 6px 6px' : '0',
      ...(orientation === 'horizontal' && !isLast ? { borderRight: 'none' } : {}),
      ...(orientation === 'vertical' && !isLast ? { borderBottom: 'none' } : {}),
    } : {};

    return React.cloneElement(child as React.ReactElement<any>, {
      size: size || (child as React.ReactElement<any>).props.size,
      variant: variant || (child as React.ReactElement<any>).props.variant,
      shape: connected ? 'default' : (shape || (child as React.ReactElement<any>).props.shape),
      style: {
        ...(child as React.ReactElement<any>).props.style,
        ...connectedStyle,
      },
    });
  });

  return (
    <div
      className={`rottay-button-group rottay-button-group--${orientation} ${connected ? 'rottay-button-group--connected' : ''} ${className}`}
      style={groupStyle}
      role="group"
    >
      {enhancedChildren}
    </div>
  );
}

ButtonGroup.displayName = 'Button.Group';
