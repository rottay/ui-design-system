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
import type { InputGroupProps } from '../../contracts';

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
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement<{ size?: string }>(child)) return child;
    if (child.type === React.Fragment) return child;
    // Native elements have their own unrelated `size` attribute. Never leak
    // the design-system size enum into the DOM when callers mix in a button,
    // label, or other intrinsic child.
    if (typeof child.type === 'string') return child;
    return React.cloneElement(child, {
      size: child.props.size || size,
    });
  });

  return (
    <div
      className={`rottay-input-group ${className}`.trim()}
      data-part="group"
      data-size={size}
      data-compact={compact ? 'true' : 'false'}
      style={style}
    >
      {enhancedChildren}
    </div>
  );
}

InputGroup.displayName = 'Input.Group';
