'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the Kbd display primitive.
 * Leverages DaisyUI's built-in `kbd` component class, keeping the implementation
 * minimal -- just a single `<kbd>` with size and font-mono utility classes.
 *
 * @example
 * ```tsx
 * <Kbd engine="modern" size="sm">Shift</Kbd>
 * ```
 */

import React from 'react';
import type { KbdProps } from '../Kbd.types';
import { KBD_DEFAULTS } from '../Kbd.types';

/** Maps DS size tokens to DaisyUI `kbd-*` modifier classes (md has no modifier). */
const SIZE_CLASSES: Record<string, string> = {
  sm: 'kbd-sm',
  md: '',
  lg: 'kbd-lg',
};

/**
 * Modern Kbd engine. Delegates all visual styling to DaisyUI's `kbd` class,
 * which provides the key-cap appearance, border, and background automatically.
 *
 * @param props - KbdProps with children content and optional size/className/style.
 * @returns A DaisyUI-styled `<kbd>` element.
 */
export default function ModernKbd(props: KbdProps): React.ReactElement {
  const {
    children,
    size = KBD_DEFAULTS.size,
    className = '',
    style,
  } = props;

  // Empty string for 'md' is intentional -- DaisyUI's base `kbd` class is medium
  const sizeClass = SIZE_CLASSES[size] || '';

  // `font-mono` is added explicitly because DaisyUI's `kbd` does not enforce it
  return (
    <kbd
      className={`kbd ${sizeClass} font-mono ${className}`}
      style={style}
    >
      {children}
    </kbd>
  );
}

ModernKbd.displayName = 'Kbd.Modern';
