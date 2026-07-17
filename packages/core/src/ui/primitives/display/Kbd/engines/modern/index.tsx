'use client';

/**
 * @fileoverview Modern engine for the Kbd display primitive. A single `<kbd>`
 * element carrying no DaisyUI class: the key-cap chrome is painted by
 * `foundation/tokens/css/runtime/engines/modern/skin/kbd.css`, keyed on the `data-part`/`data-size`
 * contract stamped below. Size dimensions and a caller's own `style` stay inline.
 *
 * @example
 * ```tsx
 * <Kbd engine="modern" size="sm">Shift</Kbd>
 * ```
 */

import React from 'react';
import type { KbdProps } from '../../contracts';
import { KBD_DEFAULTS } from '../../contracts';

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
      className={`rottay-kbd rottay-kbd--modern ${className}`.trim()}
      data-part="root"
      data-size={size}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        fontWeight: 500,
        lineHeight: 1,
        ...sizeStyle,
        ...style,
      }}
    >
      {children}
    </kbd>
  );
}

ModernKbd.displayName = 'Kbd.Modern';
