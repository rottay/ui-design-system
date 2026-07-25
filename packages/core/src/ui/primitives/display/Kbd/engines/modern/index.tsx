'use client';

/**
 * @fileoverview Modern engine for the Kbd display primitive. A single `<kbd>`
 * element carrying no DaisyUI class: the key-cap chrome, geometry, typography
 * and high-contrast policy are painted by
 * `foundation/tokens/css/runtime/engines/modern/skin/kbd.css`, keyed on the
 * `data-part`/`data-size` contract stamped below. A caller's own `style` stays
 * inline and outranks the skin.
 *
 * @example
 * ```tsx
 * <Kbd engine="modern" size="sm">Shift</Kbd>
 * ```
 */

import React from 'react';
import type { KbdProps } from '../../contracts';
import { KBD_DEFAULTS } from '../../contracts';

/**
 * Modern Kbd engine. Stamps the skin contract; every visual decision is the
 * skin's, so identical markup renders identically in any app.
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

  return (
    <kbd
      className={`rottay-kbd rottay-kbd--modern ${className}`.trim()}
      data-part="root"
      data-size={size}
      style={style}
    >
      {children}
    </kbd>
  );
}

ModernKbd.displayName = 'Kbd.Modern';
