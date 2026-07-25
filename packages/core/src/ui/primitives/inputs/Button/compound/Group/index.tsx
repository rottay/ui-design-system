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
import type { ButtonSize, ButtonVariant, ButtonShape } from '../../contracts';

export interface ButtonGroupProps {
  /** Group children (Button components) */
  children: ReactNode;
  /** Group orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Whether buttons are connected (no gap) */
  connected?: boolean;
  /** Spacing between buttons (ignored if connected). Defaults to the tenant token. */
  spacing?: number | string;
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
  /** Accessible name for groups whose surrounding context is not sufficient. */
  'aria-label'?: string;
}

/**
 * ButtonGroup component for grouping multiple buttons
 */
export function ButtonGroup({
  children,
  orientation = 'horizontal',
  connected = false,
  spacing,
  size,
  variant,
  shape,
  className = '',
  style,
  'aria-label': ariaLabel,
}: ButtonGroupProps): React.ReactElement {
  const groupStyle = {
    ...(spacing == null
      ? {}
      : {
          '--ds-button-group-instance-gap':
            typeof spacing === 'number' ? `${spacing}px` : spacing,
        }),
    ...style,
  } as CSSProperties;

  // Clone children to pass down size/variant/shape if provided
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child as React.ReactElement<any>, {
      size: size || (child as React.ReactElement<any>).props.size,
      variant: variant || (child as React.ReactElement<any>).props.variant,
      shape: connected ? 'default' : (shape || (child as React.ReactElement<any>).props.shape),
    });
  });

  return (
    <div
      className={`rottay-button-group rottay-button-group--${orientation} ${connected ? 'rottay-button-group--connected' : ''} ${className}`}
      style={groupStyle}
      role="group"
      aria-label={ariaLabel}
      data-part="group"
      data-orientation={orientation}
      data-connected={connected ? 'true' : 'false'}
      data-size={size}
    >
      {enhancedChildren}
    </div>
  );
}

ButtonGroup.displayName = 'Button.Group';
