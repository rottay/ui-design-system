'use client';

/**
 * @fileoverview Classic (Ant Design-styled) engine for the Kbd display primitive.
 * Renders a keyboard-key indicator using inline styles that mirror Ant Design's
 * visual language -- 3D border-bottom, neutral background, monospace font.
 *
 * @example
 * ```tsx
 * <Kbd engine="classic" size="md">Ctrl</Kbd>
 * ```
 */

import React from 'react';
import type { KbdProps } from '../../contracts';
import { KBD_DEFAULTS } from '../../contracts';

/** Size presets controlling font size, padding, and minimum tap-target width. */
const SIZE_STYLES: Record<string, { fontSize: number; padding: string; minWidth: number }> = {
  sm: { fontSize: 11, padding: '1px 5px', minWidth: 20 },
  md: { fontSize: 13, padding: '2px 7px', minWidth: 24 },
  lg: { fontSize: 15, padding: '3px 9px', minWidth: 28 },
};

/**
 * Classic Kbd engine. Renders a `<kbd>` element styled to resemble a physical
 * keyboard key using Ant Design's neutral palette and a subtle 3D border effect.
 *
 * @param props - KbdProps with children content and optional size/className/style.
 * @returns A styled `<kbd>` element.
 */
export default function ClassicKbd(props: KbdProps): React.ReactElement {
  const {
    children,
    size = KBD_DEFAULTS.size,
    className = '',
    style,
  } = props;

  // Fall back to 'md' when an unknown size is provided
  const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.md;

  // All styling is inline to keep this engine free of Tailwind/antd runtime deps.
  // The thicker border-bottom creates the 3D "raised key" illusion.
  return (
    <kbd
      className={`rottay-kbd-classic ${className}`}
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
        backgroundColor: 'var(--ds-color-neutral-100, #f5f5f5)',
        border: '1px solid var(--ds-color-neutral-300, #d9d9d9)',
        borderBottom: '2px solid var(--ds-color-neutral-400, #bfbfbf)',
        borderRadius: 4,
        color: 'var(--ds-color-text-primary, #262626)',
        boxShadow: '0 1px 0 rgba(0, 0, 0, 0.06)',
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

ClassicKbd.displayName = 'Kbd.Classic';
