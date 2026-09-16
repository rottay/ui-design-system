/**
 * @fileoverview The inline craft-style resolver of the FROZEN engines.
 *
 * Classic and rustic have no skin rule for these states -- classic has no skin
 * at all -- so this inline emission is the only thing that paints them. The
 * modern engine's skin paints every one of these blocks on the state it
 * stamps, so modern does not call this at all; that is what lets the family
 * gate stop censusing a module no live engine paints through.
 *
 * @module Components/Primitives/Display/Typography/runtime/legacy-craft
 * @category Components
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';

import type {
  TypographyFamily,
  TypographyLeading,
  TypographyTracking,
} from '../../contracts';
import {
  ROLE_TOKEN_KEYS,
  isJoiningScriptLang,
  normalizeLineClamp,
  resolveFluidTypographySize,
  type ResolveTypographyStyleOptions,
} from '..';

/** Family channel per public name. */
const FAMILY_MAP: Record<TypographyFamily, string> = {
  body: 'var(--ds-font-family-base)',
  heading: 'var(--ds-font-family-heading, var(--ds-font-family-base))',
  display: 'var(--ds-font-family-display, var(--ds-font-family-heading))',
  // Declared in foundation/themes/default/index.css -> bare reference (fallback parity).
  mono: 'var(--ds-font-family-mono)',
  inherit: 'inherit',
};

const LEADING_MAP: Record<TypographyLeading, string> = {
  none: 'var(--ds-line-height-none)',
  tight: 'var(--ds-line-height-tight)',
  snug: 'var(--ds-line-height-snug)',
  normal: 'var(--ds-line-height-normal)',
  relaxed: 'var(--ds-line-height-relaxed)',
  loose: 'var(--ds-line-height-loose)',
};

const TRACKING_MAP: Record<TypographyTracking, string> = {
  tighter: 'var(--ds-letter-spacing-tighter)',
  tight: 'var(--ds-letter-spacing-tight)',
  normal: 'var(--ds-letter-spacing-normal)',
  wide: 'var(--ds-letter-spacing-wide)',
  wider: 'var(--ds-letter-spacing-wider)',
  widest: 'var(--ds-letter-spacing-widest)',
};

/**
 * Cross-engine typography resolver. It emits references to public tokens,
 * never tenant values, so the exact same DOM can be re-skinned at runtime.
 */
export function resolveTypographyCraftStyle({
  textStyle,
  includeRoleMatrix = true,
  family,
  fluid,
  leading,
  tracking,
  wrap,
  hyphenate,
  contrast,
  align,
  lang,
  kind,
  size,
  truncate,
  lineClamp,
  responsive,
}: ResolveTypographyStyleOptions): CSSProperties {
  const roleKey = textStyle ? ROLE_TOKEN_KEYS[textStyle] : undefined;
  const normalizedClamp = normalizeLineClamp(lineClamp);
  const suppressTracking = isJoiningScriptLang(lang);
  const style: CSSProperties = {
    // Matriz de rol: primera, y sigue primera -- `family` pisa su `fontFamily` y
    // `fluid` su `fontSize` justamente porque vienen despues.
    ...(includeRoleMatrix && roleKey
      ? {
          fontFamily: `var(--ds-type-${roleKey}-font-family)`,
          fontSize: `var(--ds-type-${roleKey}-font-size)`,
          fontWeight: `var(--ds-type-${roleKey}-font-weight)`,
          lineHeight: `var(--ds-type-${roleKey}-line-height)`,
          ...(suppressTracking
            ? {}
            : { letterSpacing: `var(--ds-type-${roleKey}-letter-spacing)` }),
          textTransform: `var(--ds-type-${roleKey}-text-transform)` as CSSProperties['textTransform'],
          fontVariantNumeric: `var(--ds-type-${roleKey}-font-variant-numeric)`,
        }
      : {}),
    ...(family ? { fontFamily: FAMILY_MAP[family] } : {}),
    ...(fluid && size && !responsive
      ? {
          fontSize: resolveFluidTypographySize(kind, size),
        }
      : {}),
    ...(leading ? { lineHeight: LEADING_MAP[leading] } : {}),
    ...(tracking && !suppressTracking ? { letterSpacing: TRACKING_MAP[tracking] } : {}),
    ...(align ? { textAlign: align } : {}),
    ...(wrap === 'balance'
      ? { textWrap: 'balance' }
      : wrap === 'pretty'
        ? { textWrap: 'pretty' }
        : wrap === 'nowrap'
          ? { whiteSpace: 'nowrap' }
          : {}),
    // `hyphens`, `overflow-wrap` and the three optical channels are painted by
    // the skin on the scope and on the `data-hyphenate` this render stamps.
    ...(truncate && !normalizedClamp
      ? {
          display: 'inline-block',
          maxWidth: '100%',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          verticalAlign: 'bottom',
        }
      : {}),
    ...(normalizedClamp
      ? {
          ['--ds-type-line-clamp' as any]: normalizedClamp,
          display: '-webkit-box',
          WebkitLineClamp: normalizedClamp,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }
      : {}),
  };

  return style;
}
