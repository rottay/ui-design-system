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

/** Maps size tokens to inline style dimensions using DS token references. */
const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { padding: 'var(--ds-kbd-sm-padding, 1px 4px)', fontSize: 'var(--ds-font-size-xs, 0.75rem)', minHeight: 'var(--ds-kbd-sm-min-height, 20px)' },
  md: { padding: 'var(--ds-kbd-md-padding, 2px 6px)', fontSize: 'var(--ds-font-size-xs, 0.75rem)', minHeight: 'var(--ds-kbd-md-min-height, 24px)' },
  lg: { padding: 'var(--ds-kbd-lg-padding, 3px 8px)', fontSize: 'var(--ds-font-size-sm, 0.875rem)', minHeight: 'var(--ds-kbd-lg-min-height, 28px)' },
};

/**
 * Modern Kbd engine. DS token inline styles for key-cap appearance.
 *
 * @param props - KbdProps with children content and optional size/className/style.
 * @returns A DS-token-styled `<kbd>` element.
 */
export default function ModernKbd(props: KbdProps): React.ReactElement {
  const {
    children,
    size = KBD_DEFAULTS.size,
    className = '',
    style,
  } = props;

  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <kbd
      className={className || undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        fontWeight: 500,
        lineHeight: 1,
        borderRadius: 'var(--ds-radius-sm)',
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-surface-inset)',
        color: 'var(--ds-color-text-primary)',
        ...sizeStyle,
        ...style,
      }}
    >
      {children}
    </kbd>
  );
}

ModernKbd.displayName = 'Kbd.Modern';
