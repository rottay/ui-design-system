/**
 * @fileoverview InputGroup - Rottay Design System
 * @description Compound component that groups an Input with Addon elements,
 * handling border radius merging and consistent sizing across children.
 *
 * @remarks
 * InputGroup provides a container for combining inputs with addons (prefixes,
 * suffixes, or buttons). In compact mode, adjacent borders are merged and
 * border radii are adjusted so grouped elements appear as a single control.
 *
 * **Key Features:**
 * - Compact mode merges borders and adjusts border radii automatically
 * - Non-compact mode spaces children with an 8px gap
 * - Cascades the `size` prop to all children that accept it
 * - Full-width layout via inline-flex with 100% width
 *
 * **Border Radius Logic (compact mode):**
 * - First child: keeps left radii, zeroes right radii
 * - Middle children: zeroes all radii
 * - Last child: zeroes left radii, keeps right radii
 * - Non-first children shift left by -1px to collapse double borders
 *
 * @example Compact Group with Addons
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input.Group compact>
 *   <Input.Addon position="before">https://</Input.Addon>
 *   <Input placeholder="example.com" />
 *   <Input.Addon position="after">.com</Input.Addon>
 * </Input.Group>
 * ```
 *
 * @example Non-Compact Group
 * ```tsx
 * <Input.Group compact={false}>
 *   <Input placeholder="First name" />
 *   <Input placeholder="Last name" />
 * </Input.Group>
 * ```
 *
 * @see {@link InputAddon} for prefix/suffix addons
 * @see {@link Input} for the main input component
 * @module InputGroup
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { InputGroupProps } from '../../Input.types';

/**
 * Groups inputs and addons into a single visual unit with merged borders.
 *
 * @param props - {@link InputGroupProps}
 * @returns A container div with enhanced children (adjusted borders and sizes)
 *
 * @example
 * ```tsx
 * <Input.Group compact size="md">
 *   <Input.Addon position="before">$</Input.Addon>
 *   <Input placeholder="Amount" />
 * </Input.Group>
 * ```
 */
export function InputGroup({
  children,
  size = 'md',
  compact = true,
  className = '',
  style,
}: InputGroupProps): React.ReactElement {
  const groupStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'stretch',
    width: '100%',
    ...style,
  };

  // Clone children to pass down size prop and handle border radius
  const childArray = React.Children.toArray(children);

  const enhancedChildren = childArray.map((child, index) => {
    if (!React.isValidElement<{ style?: CSSProperties; size?: string }>(child)) return child;

    const isFirst = index === 0;
    const isLast = index === childArray.length - 1;

    const childStyle: CSSProperties = {
      ...(child.props.style || {}),
    };

    // Handle border radius for compact mode
    if (compact) {
      if (!isFirst && !isLast) {
        childStyle.borderTopLeftRadius = 0;
        childStyle.borderTopRightRadius = 0;
        childStyle.borderBottomRightRadius = 0;
        childStyle.borderBottomLeftRadius = 0;
      } else if (isFirst && !isLast) {
        childStyle.borderTopRightRadius = 0;
        childStyle.borderBottomRightRadius = 0;
      } else if (isLast && !isFirst) {
        childStyle.borderTopLeftRadius = 0;
        childStyle.borderBottomLeftRadius = 0;
      }

      // Remove left border for non-first items to avoid double borders
      if (!isFirst) {
        childStyle.marginLeft = -1;
      }
    } else {
      // Add gap between items
      if (!isFirst) {
        childStyle.marginLeft = 8;
      }
    }

    return React.cloneElement(child, {
      size: child.props.size || size,
      style: childStyle,
    });
  });

  return (
    <div
      className={`rottay-input-group ${className}`}
      style={groupStyle}
    >
      {enhancedChildren}
    </div>
  );
}

InputGroup.displayName = 'Input.Group';
