/**
 * @fileoverview InputAddon - Rottay Design System
 * @description Compound component that renders a decorative or functional addon
 * element attached to an Input, typically used within an Input.Group.
 *
 * @remarks
 * InputAddon provides visual prefixes and suffixes for input fields, such as
 * currency symbols, units of measurement, or short labels. It is designed to
 * be used inside an Input.Group for proper border radius handling.
 *
 * **Key Features:**
 * - Position-aware rendering (before or after the input)
 * - Size-synchronized with sibling inputs via SIZE_MAP
 * - Transparent or default background variants
 * - Theming via CSS variables for colors and borders
 *
 * **Accessibility:**
 * - Renders as a `<span>`, acting as a presentational element
 * - Text content is read inline with the input by screen readers
 *
 * @example Currency Prefix
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input.Group compact>
 *   <Input.Addon position="before">$</Input.Addon>
 *   <Input placeholder="0.00" type="number" />
 * </Input.Group>
 * ```
 *
 * @example Unit Suffix
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input.Group compact>
 *   <Input placeholder="Weight" />
 *   <Input.Addon position="after">kg</Input.Addon>
 * </Input.Group>
 * ```
 *
 * @see {@link InputGroup} for the parent group container
 * @see {@link Input} for the main input component
 * @module InputAddon
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { InputAddonProps } from '../../Input.types';
import { SIZE_MAP } from '../../Input.types';

/**
 * Addon element for input groups that renders a decorative prefix or suffix.
 *
 * @param props - {@link InputAddonProps}
 * @returns A styled span element positioned before or after an input
 *
 * @example
 * ```tsx
 * <Input.Addon position="before" size="md">https://</Input.Addon>
 * ```
 */
export function InputAddon({
  children,
  position = 'before',
  size = 'md',
  variant = 'default',
  className = '',
  style,
}: InputAddonProps): React.ReactElement {
  const sizeValues = SIZE_MAP[size] || SIZE_MAP.md;

  const addonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: sizeValues.height,
    padding: `0 ${sizeValues.paddingX}`,
    fontSize: sizeValues.fontSize,
    backgroundColor: variant === 'transparent' ? 'transparent' : 'var(--ds-color-bg-secondary)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--ds-color-border-secondary)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 6,
    color: 'var(--ds-color-text-secondary)',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    ...style,
  };

  return (
    <span
      className={`rottay-input-addon ds-input-addon rottay-input-addon--${position} ${className}`}
      data-part="root"
      style={addonStyle}
    >
      {children}
    </span>
  );
}

InputAddon.displayName = 'Input.Addon';
