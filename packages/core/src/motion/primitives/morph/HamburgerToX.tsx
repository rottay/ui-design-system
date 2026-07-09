/**
 * @fileoverview HamburgerToX icon morph - Rottay Design System
 * @description Three-bar hamburger icon that morphs into an X, driven by a
 * single `open` boolean. Transform/opacity only (translateY + rotate on the
 * top/bottom bars, opacity on the middle bar) -- no layout animation, unlike
 * the generic `Morph` primitive, which is why this is a dedicated component
 * rather than `<Morph>` wrapping a swapped child: a same-size icon state
 * change has no position/size to interpolate, and `Morph`'s `AnimatePresence
 * mode="wait"` would sequence the two icons (fade out, THEN fade in) instead
 * of transforming one shape into the other.
 *
 * @module Motion/Primitives/Morph/HamburgerToX
 * @category Motion
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import { useBreakpoints } from '../../../hooks';

export interface HamburgerToXProps {
  /** Whether the icon shows the X (open) state. `false` shows the hamburger. */
  open: boolean;
  /** Icon box size in pixels (bars scale proportionally). @default 20 */
  size?: number;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles applied to the outer box. */
  style?: CSSProperties;
}

/**
 * Hamburger-to-X icon morph for menu toggles.
 *
 * @example
 * ```tsx
 * <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
 *   <HamburgerToX open={open} />
 * </button>
 * ```
 */
export function HamburgerToX({ open, size = 20, className, style }: HamburgerToXProps): React.ReactElement {
  const { prefersReducedMotion } = useBreakpoints();

  const barHeight = Math.max(1.5, size * 0.1);
  const barWidth = size * 0.75;
  const inset = (size - barWidth) / 2;
  const centerY = size / 2;
  // Vertical distance from the resting top/bottom bar position to center,
  // where the X's two bars converge.
  const offset = size * 0.22;

  const transition = prefersReducedMotion
    ? 'none'
    : 'transform var(--ds-motion-fast) var(--ds-motion-ease-out), opacity var(--ds-motion-fast) var(--ds-motion-ease-out)';

  const barBase: CSSProperties = {
    position: 'absolute',
    left: inset,
    width: barWidth,
    height: barHeight,
    borderRadius: barHeight / 2,
    background: 'currentColor',
    transformOrigin: 'center',
    transition,
  };

  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'inline-block', width: size, height: size, ...style }}
      aria-hidden="true"
    >
      <span
        data-bar="top"
        style={{
          ...barBase,
          top: centerY - offset - barHeight / 2,
          transform: open ? `translateY(${offset}px) rotate(45deg)` : 'none',
        }}
      />
      <span
        data-bar="middle"
        style={{
          ...barBase,
          top: centerY - barHeight / 2,
          opacity: open ? 0 : 1,
        }}
      />
      <span
        data-bar="bottom"
        style={{
          ...barBase,
          top: centerY + offset - barHeight / 2,
          transform: open ? `translateY(-${offset}px) rotate(-45deg)` : 'none',
        }}
      />
    </span>
  );
}

HamburgerToX.displayName = 'HamburgerToX';
