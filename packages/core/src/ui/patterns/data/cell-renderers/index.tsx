/**
 * @fileoverview Reusable cell renderer helpers for data tables.
 *
 * Domain-agnostic rendering functions for common table cell patterns.
 * Used by app-platform, app-bithire, and app-evnto in their
 * renderCell config factories.
 *
 * All renderers expose DS anatomy hooks and use DS CSS variables only.
 * They intentionally return lightweight raw elements and have zero domain awareness.
 *
 * @example
 * ```tsx
 * import { cellRenderers } from '@rottay/design-system';
 *
 * const config = {
 *   presentation: {
 *     renderCell: {
 *       'user.name': (_, row) => cellRenderers.avatarName(row.name, row.email),
 *       'user.status': (_, row) => cellRenderers.statusBadge(row.statusLabel, row.statusVariant),
 *       'user.email': (_, row) => cellRenderers.iconText(Mail, row.email),
 *       'user.createdAt': (v) => cellRenderers.date(v as string),
 *     },
 *   },
 * } satisfies ListSurfaceConfig<UserView>;
 * ```
 *
 * @module CellRenderers
 * @category Patterns/Data
 * @package @rottay/design-system
 */

'use client';

import React from 'react';

const CELL_RENDERER_SCOPE_CLASS = 'ds-pattern-cell-renderers';

type CellRendererIcon = React.ComponentType<{
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  'data-part'?: string;
}>;

// ── Types ─────────────────────────────────────────────────

export interface AvatarNameOptions {
  /** Avatar size. Default: 'sm' */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show only initials (no Avatar component). Default: false */
  initialsOnly?: boolean;
  /** Max subtitle length before truncating. Default: no truncation */
  maxSubtitleLength?: number;
}

export interface MonospaceOptions {
  /** Text size. Default: 'sm' */
  size?: 'xs' | 'sm' | 'md';
  /** Color CSS var. Default: '--ds-color-text-muted' */
  color?: string;
  /** Max characters before truncating. Default: no truncation */
  maxLength?: number;
}

export interface IconTextOptions {
  /** Gap between icon and text in px. Default: 6 */
  gap?: number;
  /** Icon size in px. Default: 14 */
  iconSize?: number;
  /** Placeholder text when value is empty */
  placeholder?: string;
}

export interface TagsOptions {
  /** Max tags to display before "+N more". Default: 3 */
  maxDisplay?: number;
  /** Badge variant. Default: 'secondary' */
  variant?: string;
  /** Badge size. Default: 'sm' */
  size?: 'xs' | 'sm' | 'md';
}

export interface ScoreOptions {
  /** Bar width in px. Default: 60 */
  barWidth?: number;
  /** Bar height in px. Default: 6 */
  barHeight?: number;
  /** Custom color thresholds. Default: 0-33 error, 34-66 warning, 67-100 success */
  thresholds?: { low: number; mid: number };
}

export type CellBadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

const CELL_BADGE_VARIANTS = new Set<CellBadgeVariant>([
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
]);

// ── Renderers ─────────────────────────────────────────────

/**
 * Avatar + name with optional subtitle.
 *
 * ```
 * [Avatar] Name
 *          subtitle
 * ```
 */
function avatarName(
  name: string,
  subtitle?: string | null,
  options?: AvatarNameOptions,
): React.ReactElement {
  const size = options?.size ?? 'sm';
  const sizeMap = { xs: 24, sm: 32, md: 40, lg: 48 };
  const fontSizeMap = { xs: 10, sm: 12, md: 14, lg: 16 };
  const dim = sizeMap[size];

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return React.createElement('div', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'avatar-name',
    'data-size': size,
    'data-has-subtitle': subtitle ? 'true' : 'false',
    style: { display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3, 12px)' },
  },
    React.createElement('div', {
      'data-part': 'avatar',
      // The initials tile is decorative redundancy: the adjacent name carries
      // the same information, so AT must not announce it twice.
      'aria-hidden': 'true',
      style: {
        width: dim,
        height: dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fontSizeMap[size],
        fontWeight: 500,
        flexShrink: 0,
      },
    }, initials),
    React.createElement('div', { 'data-part': 'content', style: { minWidth: 0 } },
      React.createElement('div', {
        'data-part': 'name',
        style: {
          fontWeight: 500,
          fontSize: 'var(--ds-font-size-sm, 14px)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }, name),
      subtitle ? React.createElement('div', {
        'data-part': 'subtitle',
        // CSS-ellipsis truncation pairs with the native tooltip reveal.
        title: subtitle,
        style: {
          fontSize: 'var(--ds-font-size-xs, 12px)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: options?.maxSubtitleLength ? `${options.maxSubtitleLength}ch` : undefined,
        },
      }, subtitle) : null,
    ),
  );
}

/**
 * Name + subtitle stacked (no avatar).
 *
 * ```
 * Name
 * subtitle
 * ```
 */
function nameStack(
  name: string,
  subtitle?: string | null,
): React.ReactElement {
  return React.createElement('div', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'name-stack',
    'data-has-subtitle': subtitle ? 'true' : 'false',
  },
    React.createElement('div', {
      'data-part': 'name',
      style: { fontWeight: 500 },
    }, name),
    subtitle ? React.createElement('div', {
      'data-part': 'subtitle',
      style: { fontSize: 'var(--ds-font-size-xs, 12px)' },
    }, subtitle) : null,
  );
}

/**
 * Status badge with dynamic variant.
 *
 * ```
 * [Active]  (green badge)
 * ```
 */
function renderBadge(
  label: string,
  variant: CellBadgeVariant,
  part: 'status-badge' | 'simple-badge',
): React.ReactElement {
  const resolvedVariant = CELL_BADGE_VARIANTS.has(variant) ? variant : 'secondary';
  return React.createElement('span', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': part,
    'data-variant': resolvedVariant,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      fontSize: 'var(--ds-font-size-xs, 12px)',
      fontWeight: 500,
      lineHeight: '18px',
      whiteSpace: 'nowrap',
    },
  }, label);
}

function statusBadge(
  label: string,
  variant: CellBadgeVariant = 'secondary',
): React.ReactElement {
  return renderBadge(label, variant, 'status-badge');
}

/**
 * Simple badge (fixed variant, typically secondary).
 */
function simpleBadge(
  label: string,
  variant: CellBadgeVariant = 'secondary',
): React.ReactElement {
  return renderBadge(label, variant, 'simple-badge');
}

/**
 * Monospace text for IDs, slugs, dates, codes.
 *
 * ```
 * abc-123-def
 * ```
 */
function mono(
  value: string | number | null | undefined,
  options?: MonospaceOptions,
): React.ReactElement {
  const display = value == null ? '--' : String(value);
  const isTruncated = Boolean(options?.maxLength && display.length > options.maxLength);
  const truncated = isTruncated
    ? display.slice(0, options!.maxLength) + '…'
    : display;

  return React.createElement('span', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'mono',
    'data-empty': value == null ? 'true' : 'false',
    'data-size': options?.size ?? 'sm',
    // Truncation carries its reveal strategy: the full value is one hover away.
    title: isTruncated ? display : undefined,
    style: {
      fontFamily: 'var(--ds-font-family-mono, monospace)',
      fontSize: `var(--ds-font-size-${options?.size ?? 'sm'}, 13px)`,
      '--ds-cell-renderers-mono-color': options?.color ?? 'var(--ds-color-text-muted)',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,
  }, truncated);
}

/**
 * Icon + text pair.
 *
 * ```
 * [icon] value
 * ```
 */
function iconText(
  Icon: CellRendererIcon,
  value: string | null | undefined,
  options?: IconTextOptions,
): React.ReactElement {
  const display = value || options?.placeholder || '--';
  return React.createElement('div', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'icon-text',
    'data-empty': value ? 'false' : 'true',
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: options?.gap ?? 6,
    },
  },
    React.createElement(Icon, {
      className: 'ds-cell-renderers__icon',
      'data-part': 'icon',
      size: options?.iconSize ?? 14,
      style: { flexShrink: 0 },
    }),
    React.createElement('span', {
      'data-part': 'value',
      style: {
        fontSize: 'var(--ds-font-size-sm, 14px)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    }, display),
  );
}

/**
 * Icon + count label.
 *
 * ```
 * [icon] 12
 * ```
 */
function countWithIcon(
  Icon: CellRendererIcon,
  count: number,
  label?: string,
): React.ReactElement {
  return React.createElement('div', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'count-with-icon',
    'data-has-label': label ? 'true' : 'false',
    style: { display: 'inline-flex', alignItems: 'center', gap: 6 },
  },
    React.createElement(Icon, {
      className: 'ds-cell-renderers__icon',
      'data-part': 'icon',
      size: 14,
      style: { flexShrink: 0 },
    }),
    React.createElement('span', {
      'data-part': 'value',
      style: { fontSize: 'var(--ds-font-size-sm, 14px)' },
    }, label ? `${count} ${label}` : String(count)),
  );
}

/**
 * Formatted date string.
 */
function date(
  value: string | Date | null | undefined,
  options?: { format?: 'short' | 'long' | 'relative'; mono?: boolean },
): React.ReactElement {
  if (!value) return React.createElement('span', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'date',
    'data-empty': 'true',
  }, '--');

  const d = typeof value === 'string' ? new Date(value) : value;
  let formatted: string;

  try {
    formatted = options?.format === 'long'
      ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    formatted = String(value);
  }

  return React.createElement('span', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'date',
    'data-empty': 'false',
    style: {
      fontSize: 'var(--ds-font-size-sm, 14px)',
      fontFamily: options?.mono !== false ? 'var(--ds-font-family-mono, monospace)' : undefined,
      whiteSpace: 'nowrap',
    },
  }, formatted);
}

/**
 * Tags/pills with overflow.
 *
 * ```
 * [Tag1] [Tag2] [Tag3] +2 more
 * ```
 */
function tags(
  items: string[],
  options?: TagsOptions,
): React.ReactElement {
  const max = options?.maxDisplay ?? 3;
  const visible = items.slice(0, max);
  const overflow = items.length - max;

  return React.createElement('div', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'tags',
    'data-empty': items.length === 0 ? 'true' : 'false',
    style: { display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  },
    ...visible.map(tag =>
      React.createElement('span', {
        key: tag,
        'data-part': 'tag',
        style: {
          display: 'inline-flex',
          padding: '1px 6px',
          fontSize: 'var(--ds-font-size-xs, 12px)',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        },
      }, tag),
    ),
    overflow > 0
      ? React.createElement('span', {
          'data-part': 'overflow',
          'data-count': overflow,
          // The collapsed tags keep a reveal path: the hidden names are one
          // hover away, same contract as the other truncating renderers.
          title: items.slice(max).join(', '),
          style: { fontSize: 'var(--ds-font-size-xs, 12px)' },
        }, `+${overflow}`)
      : null,
  );
}

/**
 * Score/progress bar (0-100).
 *
 * ```
 * [===     ] 42
 * ```
 */
function score(
  value: number,
  options?: ScoreOptions,
): React.ReactElement {
  const low = options?.thresholds?.low ?? 33;
  const mid = options?.thresholds?.mid ?? 66;
  const band = value <= low ? 'low' : value <= mid ? 'mid' : 'high';
  const width = options?.barWidth ?? 60;
  const height = options?.barHeight ?? 6;

  const clamped = Math.min(100, Math.max(0, value));

  return React.createElement('div', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'score',
    'data-band': band,
    'data-value': value,
    // The band color is decorative redundancy; the quantitative reading is a
    // native meter so assistive tech gets min/max/now without the palette.
    role: 'meter',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': clamped,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      '--ds-cell-renderers-score-radius': `${height / 2}px`,
    } as React.CSSProperties,
  },
    React.createElement('div', {
      'data-part': 'score-track',
      'aria-hidden': 'true',
      style: {
        width,
        height,
        overflow: 'hidden',
      },
    },
      React.createElement('div', {
        'data-part': 'score-bar',
        'data-band': band,
        style: {
          width: `${clamped}%`,
          height: '100%',
        },
      }),
    ),
    React.createElement('span', {
      'data-part': 'score-value',
      'data-band': band,
      style: {
        fontSize: 'var(--ds-font-size-xs, 12px)',
        fontWeight: 600,
        minWidth: 24,
      },
    }, value),
  );
}

/**
 * Boolean value display.
 *
 * ```
 * [check] Yes   or   [x] No
 * ```
 */
function boolean(
  value: boolean | null | undefined,
  options?: { trueLabel?: string; falseLabel?: string },
): React.ReactElement {
  const isTrue = Boolean(value);
  return React.createElement('span', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'boolean',
    'data-value': isTrue ? 'true' : 'false',
    'data-empty': value == null ? 'true' : 'false',
    style: {
      fontSize: 'var(--ds-font-size-sm, 14px)',
      fontWeight: isTrue ? 500 : 400,
    },
  }, isTrue ? (options?.trueLabel ?? 'Yes') : (options?.falseLabel ?? 'No'));
}

/**
 * Truncated text with ellipsis.
 */
function truncated(
  value: string | null | undefined,
  maxWidth?: number | string,
): React.ReactElement {
  return React.createElement('span', {
    className: CELL_RENDERER_SCOPE_CLASS,
    'data-part': 'truncated',
    'data-empty': value == null ? 'true' : 'false',
    // Ellipsis truncation is only honest with a reveal path: the full string
    // stays available as the native tooltip.
    title: value ?? undefined,
    style: {
      display: 'inline-block',
      maxWidth: maxWidth ?? 200,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: 'var(--ds-font-size-sm, 14px)',
    },
  }, value ?? '--');
}

// ── Export ─────────────────────────────────────────────────

/**
 * Pre-built cell renderer helpers for data tables.
 *
 * All renderers are domain-agnostic and use DS primitives + CSS vars only.
 */
export const cellRenderers = {
  /** Avatar + name with optional subtitle */
  avatarName,
  /** Name + subtitle stacked (no avatar) */
  nameStack,
  /** Status badge with dynamic variant color */
  statusBadge,
  /** Simple badge (fixed variant) */
  simpleBadge,
  /** Monospace text for IDs, slugs, codes */
  mono,
  /** Icon + text pair */
  iconText,
  /** Icon + count label */
  countWithIcon,
  /** Formatted date */
  date,
  /** Tags/pills with overflow */
  tags,
  /** Score/progress bar (0-100) */
  score,
  /** Boolean display */
  boolean,
  /** Truncated text with ellipsis */
  truncated,
} as const;

export type CellRenderers = typeof cellRenderers;
