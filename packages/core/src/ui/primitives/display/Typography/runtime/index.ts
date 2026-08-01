import type { CSSProperties } from 'react';
import type {
  TextSize,
  TypographyAlign,
  TypographyCraftProps,
  TypographyFamily,
  TypographyLeading,
  TypographyStyle,
  TypographyTracking,
  TypographyWrap,
} from '../contracts';

type TypographyKind = 'heading' | 'text';

const ROLE_TOKEN_KEYS: Record<TypographyStyle, string> = {
  display: 'display',
  pageTitle: 'page-title',
  sectionTitle: 'section-title',
  body: 'body',
  supporting: 'supporting',
  label: 'label',
  caption: 'caption',
  code: 'code',
  numeric: 'numeric',
};

const FAMILY_MAP: Record<TypographyFamily, string> = {
  body: 'var(--ds-font-family-base)',
  heading: 'var(--ds-font-family-heading, var(--ds-font-family-base))',
  display: 'var(--ds-font-family-display, var(--ds-font-family-heading))',
  // Declared in foundation/themes/default.css -> bare reference (fallback parity).
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

const TEXT_FLUID_SIZE_MAP: Record<TextSize, string> = {
  xs: 'var(--ds-font-size-fluid-sm, var(--ds-font-size-xs))',
  sm: 'var(--ds-font-size-fluid-sm, var(--ds-font-size-sm))',
  md: 'var(--ds-font-size-fluid-base, var(--ds-font-size-base))',
  lg: 'var(--ds-font-size-fluid-lg, var(--ds-font-size-lg))',
  xl: 'var(--ds-font-size-fluid-xl, var(--ds-font-size-xl))',
  '2xl': 'var(--ds-font-size-fluid-2xl, var(--ds-font-size-2xl))',
  '3xl': 'var(--ds-font-size-fluid-3xl, var(--ds-font-size-3xl))',
};

const HEADING_FLUID_SIZE_MAP: Record<TextSize, string> = {
  xs: 'var(--ds-font-size-fluid-base, var(--ds-font-size-base))',
  sm: 'var(--ds-font-size-fluid-lg, var(--ds-font-size-lg))',
  md: 'var(--ds-font-size-fluid-xl, var(--ds-font-size-xl))',
  lg: 'var(--ds-font-size-fluid-2xl, var(--ds-font-size-2xl))',
  xl: 'var(--ds-font-size-fluid-3xl, var(--ds-font-size-3xl))',
  '2xl': 'var(--ds-font-size-fluid-4xl, var(--ds-font-size-4xl))',
  '3xl': 'var(--ds-font-size-fluid-5xl, var(--ds-font-size-5xl))',
};

/** Normalizes caller input so invalid clamp values never produce broken CSS. */
export function normalizeLineClamp(lineClamp: number | undefined): number | undefined {
  if (typeof lineClamp !== 'number' || !Number.isFinite(lineClamp) || lineClamp < 1) {
    return undefined;
  }
  return Math.floor(lineClamp);
}

/**
 * Languages written in joining scripts (Arabic, Persian, Urdu, …) connect
 * letters within a word; ANY letter-spacing — positive or negative, tenant or
 * DS — visibly breaks the joining. Tracking is therefore suppressed whenever
 * the caller declares one of these languages, matching the typesetting law
 * that joining scripts must never be tracked. Only the explicit `lang` prop
 * is observable here; an inherited document lang remains the consumer's
 * responsibility to pass through (documented contract debt).
 */
const JOINING_SCRIPT_LANG_PATTERN = /^(ar|fa|ur|ps|sd|ug|ku|ckb|dv|ks)(-|$)/i;

export function isJoiningScriptLang(lang: string | undefined): boolean {
  return typeof lang === 'string' && JOINING_SCRIPT_LANG_PATTERN.test(lang.trim());
}

export interface ResolveTypographyStyleOptions extends TypographyCraftProps {
  align?: TypographyAlign;
  kind: TypographyKind;
  size?: TextSize;
  truncate?: boolean;
  lineClamp?: number;
  /** Responsive rules own font-size when true; prevents an inline override. */
  responsive?: boolean;
}

export function resolveFluidTypographySize(kind: TypographyKind, size: TextSize): string {
  return kind === 'heading' ? HEADING_FLUID_SIZE_MAP[size] : TEXT_FLUID_SIZE_MAP[size];
}

/**
 * Cross-engine typography resolver. It emits references to public tokens,
 * never tenant values, so the exact same DOM can be re-skinned at runtime.
 */
export function resolveTypographyCraftStyle({
  textStyle,
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
    ...(roleKey
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
    hyphens: hyphenate ? 'auto' : undefined,
    overflowWrap: wrap === 'nowrap' || truncate ? undefined : 'anywhere',
    // Declared in foundation/base/typography.css -> bare references (fallback parity).
    fontOpticalSizing: 'var(--ds-type-optical-sizing)' as CSSProperties['fontOpticalSizing'],
    fontSynthesis: 'var(--ds-type-font-synthesis)',
    fontVariationSettings: 'var(--ds-type-font-variation-settings)',
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

export function typographyDataAttributes({
  textStyle,
  family,
  contrast,
  motion,
  wrap,
  fluid,
}: TypographyCraftProps) {
  return {
    'data-text-style': textStyle,
    'data-family': family,
    'data-contrast': contrast,
    'data-motion': motion && motion !== 'none' ? motion : undefined,
    'data-wrap': wrap,
    'data-fluid': fluid || undefined,
  } as const;
}
