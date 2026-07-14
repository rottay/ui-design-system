'use client';

/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the Kbd display primitive.
 * Zero-dependency keyboard indicator styled entirely with inline styles and
 * DS CSS variables, featuring an inset shadow for extra depth.
 *
 * @example
 * ```tsx
 * <Kbd engine="rustic" size="lg">Enter</Kbd>
 * ```
 */

import React from 'react';
import type { KbdProps } from '../Kbd.types';
import { KBD_DEFAULTS } from '../Kbd.types';

/** Size presets controlling font size, padding, and minimum tap-target width. */
const SIZE_STYLES: Record<string, { fontSize: number; padding: string; minWidth: number }> = {
  sm: { fontSize: 11, padding: '1px 5px', minWidth: 20 },
  md: { fontSize: 13, padding: '2px 7px', minWidth: 24 },
  lg: { fontSize: 15, padding: '3px 9px', minWidth: 28 },
};

/**
 * Rustic Kbd engine. Renders a `<kbd>` element with inline styles that use DS
 * CSS variables for colors, plus a combined inset + drop shadow for a tactile
 * key-cap look -- similar to Classic but with a slightly lighter neutral palette.
 *
 * @param props - KbdProps with children content and optional size/className/style.
 * @returns A pure inline-styled `<kbd>` element.
 */
export default function RusticKbd(props: KbdProps): React.ReactElement {
  const {
    children,
    size = KBD_DEFAULTS.size,
    className = '',
    style,
  } = props;

  // Fall back to 'md' when an unknown size is provided
  const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.md;

  // Compared to Classic, Rustic uses lighter bg (neutral-50 vs 100) and adds
  // an inset shadow to simulate the concave surface of a real keycap.
  return (
    <kbd
      className={`rottay-kbd rottay-kbd--rustic rottay-kbd-rustic ${className}`}
      data-part="root"
      data-size={size}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--ds-font-family-mono, "SF Mono", "Cascadia Code", "Fira Code", monospace)',
        fontSize: sizeConfig.fontSize,
        fontWeight: 500,
        lineHeight: 1.4,
        padding: sizeConfig.padding,
        minWidth: sizeConfig.minWidth,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {children}
    </kbd>
  );
}

RusticKbd.displayName = 'Kbd.Rustic';
