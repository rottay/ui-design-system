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

/**
 * The semantic type roles a brand actually controls.
 *
 * `--ds-type-<role>-<facet>` is the sanctioned tenant typography channel: it is
 * the `TENANT_SEMANTIC_TYPOGRAPHY_TOKENS` allowlist entry, so a customer theme
 * can write it and have it accepted, and each role derives its size from
 * `--ds-type-scale` rather than from a flat literal.
 *
 * The family already resolved these roles — but only when a caller passed an
 * explicit `textStyle`, which almost no application markup does. So the roles
 * were reachable in principle and unreached in practice. Binding the tier a
 * component renders at to the role it represents puts every `Text`, `Heading`,
 * `Paragraph` and `Link` on that channel by default.
 *
 * A facet is bound ONLY where the role's declared value already equals what the
 * engine renders today, measured across the untenanted default and all three
 * compiled artifacts. A non-authored value may not displace what renders, so a
 * facet whose role value differs anywhere is left with its current owner and
 * reported instead of quietly retuned.
 */
export type TypeRole = 'display' | 'sectionTitle' | 'body' | 'supporting' | 'caption';

/**
 * Which role each heading tier renders as. The two largest tiers are the
 * display register; the rest are section titles, which is also what keeps every
 * default heading's weight bindable (h1/h2 render 700 against display's 700,
 * h3-h6 render 600 against section-title's 600).
 */
export const HEADING_TYPE_ROLE: Record<TextSize, TypeRole> = {
  xs: 'sectionTitle',
  sm: 'sectionTitle',
  md: 'sectionTitle',
  lg: 'sectionTitle',
  xl: 'sectionTitle',
  '2xl': 'display',
  '3xl': 'display',
};

/** Inline text, paragraphs and links share one tier-to-role reading. */
export const TEXT_TYPE_ROLE: Record<TextSize, TypeRole> = {
  xs: 'caption',
  sm: 'supporting',
  md: 'body',
  lg: 'body',
  xl: 'body',
  '2xl': 'body',
  '3xl': 'body',
};

/**
 * One bindable channel: the value the role resolves to in every theme, and the
 * read that replaces the literal once they agree.
 *
 * `invariant` is not a guess. It is the value `--ds-type-<role>-<facet>`
 * resolves to in the DS default AND in the bithire, evnto and rottay artifacts;
 * a facet that differs in any of them has no entry here, because binding it
 * would move a pixel on the strength of a value nobody authored for that tier.
 * That is why `font-size`, `letter-spacing` and `font-variant-numeric` appear
 * nowhere below. Every role varies its size per brand (only `section-title`
 * does not, and it matches just one heading tier and one text tier, which would
 * let a brand invert the scale at those two tiers alone). Tracking and figure
 * style are not declared by these components at all — they are INHERITED, and a
 * role resolves to a concrete value, never to `inherit`. Reading them would not
 * be a swap but a seizure: several skins set `font-variant-numeric:
 * tabular-nums` on a container (stats-grid, tag, step-wizard, live-feed,
 * progress, date-picker…), and an inline declaration on the child outranks
 * inheritance, so every `Text` inside those would silently lose its tabular
 * figures.
 *
 * The reads carry no literal fallback because these channels are always
 * declared by the foundation — the fallback-parity law this package follows.
 * Each name is spelled out rather than assembled from the role: the reach
 * census, the engine token audit and the hooks manifest all find a reader by
 * matching `var(--ds-…` in source, so an interpolated name is a read no gate
 * can see.
 */
interface TypeRoleChannel {
  /** What the role resolves to in the default and in every compiled artifact. */
  invariant: string;
  /** The declaration that takes over once the engine renders that same value. */
  read: string;
}

interface TypeRoleChannels {
  weight: TypeRoleChannel;
  /** Absent where the role's leading differs between the default and a brand. */
  lineHeight?: TypeRoleChannel;
}

const TYPE_ROLE_CHANNELS: Record<TypeRole, TypeRoleChannels> = {
  display: {
    weight: { invariant: '700', read: 'var(--ds-type-display-font-weight)' },
    lineHeight: { invariant: '1.1', read: 'var(--ds-type-display-line-height)' },
  },
  sectionTitle: {
    weight: { invariant: '600', read: 'var(--ds-type-section-title-font-weight)' },
    // Leading is 1.25 in the default and 1.3 in all three artifacts.
  },
  body: {
    weight: { invariant: '400', read: 'var(--ds-type-body-font-weight)' },
    // Leading is 1.5 in the default and 1.6 in all three artifacts.
  },
  supporting: {
    weight: { invariant: '400', read: 'var(--ds-type-supporting-font-weight)' },
    lineHeight: { invariant: '1.5', read: 'var(--ds-type-supporting-line-height)' },
  },
  caption: {
    weight: { invariant: '400', read: 'var(--ds-type-caption-font-weight)' },
    lineHeight: { invariant: '1.35', read: 'var(--ds-type-caption-line-height)' },
  },
};

export interface ResolveTypeRoleStyleOptions {
  /** Semantic role the element renders as. */
  role: TypeRole;
  /**
   * Line height the engine renders today. Pass `inherit` where it declares
   * none: no role resolves to `inherit`, so the channel correctly stays unbound.
   */
  lineHeight?: string;
  /** Numeric weight that renders today, or `undefined` when the element inherits it. */
  weight?: number;
}

/**
 * Binds one element to its semantic role, one facet at a time, and only where
 * the role already carries the value being rendered. Anything else keeps its
 * current owner, so this can never move a pixel in any theme that ships today —
 * what changes is that the brand's dial now reaches the default render path
 * instead of only the elements that opted in through `textStyle`.
 */
export function resolveTypeRoleStyle({
  role,
  lineHeight,
  weight,
}: ResolveTypeRoleStyleOptions): CSSProperties {
  const channels = TYPE_ROLE_CHANNELS[role];
  const style: CSSProperties = {};

  if (lineHeight !== undefined && channels.lineHeight?.invariant === lineHeight) {
    style.lineHeight = channels.lineHeight.read;
  }

  if (weight !== undefined && channels.weight.invariant === String(weight)) {
    style.fontWeight = channels.weight.read;
  }

  return style;
}

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
  /**
   * Si la MATRIZ DE ROL entra en el objeto devuelto. Default `true`.
   *
   * Lo pasa en `false` UNICAMENTE el engine modern, porque su matriz la pinta el
   * skin sobre el `data-text-style` que el propio engine estampa
   * (runtime/engines/modern/skin/typography.css). Classic y rustic no lo pasan
   * nunca: no tienen skin y ese inline ES su pintura, no residuo.
   *
   * No es un control de producto ni un segundo modelo de tipografia: es un campo
   * interno del resolver cross-engine, y por eso vive en el options-bag y no en la
   * API publica de Typography.
   *
   * POR QUE UN FLAG Y NO UNA FACTORIZACION (adjudicacion DT, 2026-08-27): partir
   * esta funcion en dos productores obliga a que uno delegue en el otro, y un
   * productor certificado `zeroPaint` NO PUEDE DELEGAR -- el contador de pintura
   * inline valida el contrato re-contando el cuerpo AISLADO de la funcion
   * (scripts/lib/paint/inline-paint-counter/index.mjs:804-808), texto que no lleva
   * imports, asi que toda llamada dentro suyo queda opaca y suma +1 fail-closed.
   * Medido: la version factorizada dejaba modern y rustic en 1 contra un baseline
   * de 0. El flag mantiene el objeto entero a la vista del lexer.
   */
  includeRoleMatrix?: boolean;
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
