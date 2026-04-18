/**
 * @fileoverview Reusable cell renderer helpers for data tables.
 *
 * Domain-agnostic rendering functions for common table cell patterns.
 * Used by app-platform, app-bithire, and app-evnto in their
 * renderCell config factories.
 *
 * All renderers use DS primitives (Box, Flex, Stack, Text, Badge, Avatar)
 * and DS CSS variables only. Zero domain awareness.
 *
 * @example
 * ```tsx
 * import { cellRenderers } from '@rottay/design-system';
 *
 * const config = createListSurfaceConfig({
 *   presentation: {
 *     renderCell: {
 *       'user.name': (_, row) => cellRenderers.avatarName(row.name, row.email),
 *       'user.status': (_, row) => cellRenderers.statusBadge(row.statusLabel, row.statusVariant),
 *       'user.email': (_, row) => cellRenderers.iconText(Mail, row.email),
 *       'user.createdAt': (v) => cellRenderers.date(v as string),
 *     },
 *   },
 * });
 * ```
 *
 * @module CellRenderers
 * @category Patterns/Data
 * @package @rottay/design-system
 */

'use client';

import React from 'react';

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
    style: { display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3, 10px)' },
  },
    React.createElement('div', {
      style: {
        width: dim,
        height: dim,
        borderRadius: 'var(--ds-radius-full, 9999px)',
        background: 'var(--ds-avatar-default-bg, var(--ds-color-neutral-200))',
        color: 'var(--ds-avatar-default-color, var(--ds-color-text-secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fontSizeMap[size],
        fontWeight: 500,
        flexShrink: 0,
      },
    }, initials),
    React.createElement('div', { style: { minWidth: 0 } },
      React.createElement('div', {
        style: {
          fontWeight: 500,
          color: 'var(--ds-color-text-primary)',
          fontSize: 'var(--ds-font-size-sm, 14px)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }, name),
      subtitle ? React.createElement('div', {
        style: {
          fontSize: 'var(--ds-font-size-xs, 12px)',
          color: 'var(--ds-color-text-muted)',
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
  return React.createElement('div', null,
    React.createElement('div', {
      style: { fontWeight: 500, color: 'var(--ds-color-text-primary)' },
    }, name),
    subtitle ? React.createElement('div', {
      style: { fontSize: 'var(--ds-font-size-xs, 12px)', color: 'var(--ds-color-text-muted)' },
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
function statusBadge(
  label: string,
  variant: CellBadgeVariant = 'secondary',
): React.ReactElement {
  const variantColors: Record<string, { bg: string; color: string; border: string }> = {
    primary: { bg: 'var(--ds-color-alpha-primary-10, rgba(59,130,246,0.1))', color: 'var(--ds-color-primary)', border: 'var(--ds-color-alpha-primary-20, rgba(59,130,246,0.2))' },
    secondary: { bg: 'var(--ds-color-alpha-black-100, rgba(0,0,0,0.06))', color: 'var(--ds-color-text-secondary)', border: 'transparent' },
    success: { bg: 'var(--ds-color-success-bg, rgba(34,197,94,0.1))', color: 'var(--ds-color-success)', border: 'var(--ds-color-success-border, rgba(34,197,94,0.2))' },
    warning: { bg: 'var(--ds-color-warning-bg, rgba(245,158,11,0.1))', color: 'var(--ds-color-warning)', border: 'var(--ds-color-warning-border, rgba(245,158,11,0.2))' },
    error: { bg: 'var(--ds-color-error-bg, rgba(239,68,68,0.1))', color: 'var(--ds-color-error)', border: 'var(--ds-color-error-border, rgba(239,68,68,0.2))' },
    info: { bg: 'var(--ds-color-info-bg, rgba(59,130,246,0.1))', color: 'var(--ds-color-info)', border: 'var(--ds-color-info-border, rgba(59,130,246,0.2))' },
  };
  const v = variantColors[variant] ?? variantColors.secondary;
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 'var(--ds-radius-sm, 6px)',
      fontSize: 'var(--ds-font-size-xs, 12px)',
      fontWeight: 500,
      lineHeight: '18px',
      background: v.bg,
      color: v.color,
      border: `1px solid ${v.border}`,
      whiteSpace: 'nowrap',
    },
  }, label);
}

/**
 * Simple badge (fixed variant, typically secondary).
 */
function simpleBadge(
  label: string,
  variant: CellBadgeVariant = 'secondary',
): React.ReactElement {
  return statusBadge(label, variant);
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
  const truncated = options?.maxLength && display.length > options.maxLength
    ? display.slice(0, options.maxLength) + '...'
    : display;

  return React.createElement('span', {
    style: {
      fontFamily: 'var(--ds-font-family-mono, monospace)',
      fontSize: `var(--ds-font-size-${options?.size ?? 'sm'}, 13px)`,
      color: options?.color ?? 'var(--ds-color-text-muted)',
      whiteSpace: 'nowrap',
    },
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
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>,
  value: string | null | undefined,
  options?: IconTextOptions,
): React.ReactElement {
  const display = value || options?.placeholder || '--';
  return React.createElement('div', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: options?.gap ?? 6,
    },
  },
    React.createElement(Icon, {
      size: options?.iconSize ?? 14,
      style: { color: 'var(--ds-color-text-muted)', flexShrink: 0 },
    }),
    React.createElement('span', {
      style: {
        fontSize: 'var(--ds-font-size-sm, 13px)',
        color: value ? 'var(--ds-color-text-primary)' : 'var(--ds-color-text-muted)',
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
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>,
  count: number,
  label?: string,
): React.ReactElement {
  return React.createElement('div', {
    style: { display: 'inline-flex', alignItems: 'center', gap: 6 },
  },
    React.createElement(Icon, {
      size: 14,
      style: { color: 'var(--ds-color-text-muted)', flexShrink: 0 },
    }),
    React.createElement('span', {
      style: { color: 'var(--ds-color-text-primary)', fontSize: 'var(--ds-font-size-sm, 13px)' },
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
    style: { color: 'var(--ds-color-text-disabled)' },
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
    style: {
      fontSize: 'var(--ds-font-size-sm, 13px)',
      color: 'var(--ds-color-text-muted)',
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
    style: { display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  },
    ...visible.map(tag =>
      React.createElement('span', {
        key: tag,
        style: {
          display: 'inline-flex',
          padding: '1px 6px',
          borderRadius: 'var(--ds-radius-sm, 4px)',
          fontSize: 'var(--ds-font-size-xs, 11px)',
          fontWeight: 500,
          background: 'var(--ds-color-alpha-black-100, rgba(0,0,0,0.06))',
          color: 'var(--ds-color-text-secondary)',
          whiteSpace: 'nowrap',
        },
      }, tag),
    ),
    overflow > 0
      ? React.createElement('span', {
          style: { fontSize: 'var(--ds-font-size-xs, 11px)', color: 'var(--ds-color-text-muted)' },
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
  const barColor = value <= low
    ? 'var(--ds-color-error)'
    : value <= mid
      ? 'var(--ds-color-warning)'
      : 'var(--ds-color-success)';

  const width = options?.barWidth ?? 60;
  const height = options?.barHeight ?? 6;

  return React.createElement('div', {
    style: { display: 'flex', alignItems: 'center', gap: 8 },
  },
    React.createElement('div', {
      style: {
        width,
        height,
        borderRadius: height / 2,
        background: 'var(--ds-color-border, rgba(0,0,0,0.1))',
        overflow: 'hidden',
      },
    },
      React.createElement('div', {
        style: {
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: '100%',
          borderRadius: height / 2,
          background: barColor,
          transition: 'width 300ms ease-out',
        },
      }),
    ),
    React.createElement('span', {
      style: {
        fontSize: 'var(--ds-font-size-xs, 12px)',
        fontWeight: 600,
        color: barColor,
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
    style: {
      fontSize: 'var(--ds-font-size-sm, 13px)',
      color: isTrue ? 'var(--ds-color-success)' : 'var(--ds-color-text-muted)',
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
    style: {
      display: 'inline-block',
      maxWidth: maxWidth ?? 200,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: 'var(--ds-font-size-sm, 13px)',
      color: 'var(--ds-color-text-primary)',
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
