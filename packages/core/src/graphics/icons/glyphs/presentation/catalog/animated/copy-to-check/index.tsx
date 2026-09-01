/**
 * @fileoverview CopyToCheck icon morph - Rottay Design System
 * @description Crossfades the DS CopyIcon into the DS CheckIcon, driven by a
 * `copied` boolean, for "copy to clipboard" success feedback. Opacity + scale
 * only, both icons absolute-stacked in the same box so the swap has zero
 * layout shift. Built as a dedicated component rather than `<Morph>` wrapping
 * a swapped child for the same reason as `HamburgerToX`: `Morph`'s
 * `AnimatePresence mode="wait"` sequences outgoing/incoming (a visible gap),
 * where this needs a true simultaneous crossfade.
 *
 * @module Motion/Primitives/Morph/CopyToCheck
 * @category Motion
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import { CheckIcon as Check } from '@phosphor-icons/react/dist/ssr/Check';
import { CopyIcon as Copy } from '@phosphor-icons/react/dist/ssr/Copy';
import { useMediaQuery } from '@/infrastructure/runtime/responsive/runtime/media-query';
import { createPhosphorCompatibilityIcon } from '../../../../runtime/factory/phosphor-compat';

const CopyGlyph = createPhosphorCompatibilityIcon(Copy, 'CopyToCheckCopyGlyph');
const CheckGlyph = createPhosphorCompatibilityIcon(Check, 'CopyToCheckCheckGlyph');

export interface CopyToCheckProps {
  /** Whether the icon shows the check (copied) state. `false` shows the copy icon. */
  copied: boolean;
  /** Icon size in pixels. @default 16 */
  size?: number;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles applied to the outer box. */
  style?: CSSProperties;
}

/**
 * Copy-to-check icon morph for "copy to clipboard" affordances.
 *
 * @example
 * ```tsx
 * const [copied, setCopied] = useState(false);
 * <Button onClick={() => { copyToClipboard(text); setCopied(true); }}>
 *   <CopyToCheck copied={copied} /> Copy
 * </Button>
 * ```
 */
export function CopyToCheck({ copied, size = 16, className, style }: CopyToCheckProps): React.ReactElement {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const transition = prefersReducedMotion
    ? 'none'
    : 'opacity var(--ds-motion-fast) var(--ds-motion-ease-out), transform var(--ds-motion-fast) var(--ds-motion-ease-out)';

  const layerBase: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition,
  };

  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'inline-block', width: size, height: size, ...style }}
    >
      <span
        aria-hidden={copied}
        style={{ ...layerBase, opacity: copied ? 0 : 1, transform: copied ? 'scale(0.7)' : 'scale(1)' }}
      >
        <CopyGlyph size={size} />
      </span>
      <span
        aria-hidden={!copied}
        style={{ ...layerBase, opacity: copied ? 1 : 0, transform: copied ? 'scale(1)' : 'scale(0.7)' }}
      >
        <CheckGlyph size={size} />
      </span>
    </span>
  );
}

CopyToCheck.displayName = 'CopyToCheck';
