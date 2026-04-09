'use client';

/**
 * @fileoverview record — a suite of generic record-page building blocks
 * (summary strip, field grid, read field, action footer, panel) used by
 * detail, edit, and form pages.
 *
 * @description
 * Page-structure companion to `form-sections`. The two families ship
 * together because many consumers compose them: a top-level summary
 * strip, then a stack of form-sections, then a read-field grid inside
 * one of those sections, then an action footer at the bottom.
 *
 * Exports:
 *   - `RecordSummaryStrip` — horizontal/grid summary card with 5
 *     visual variants (default, editorial, technical, governance,
 *     metrics)
 *   - `RecordFieldGrid` — pure CSS-grid wrapper for read-field layout
 *     with a configurable `gridTemplateColumns` value
 *   - `RecordField` — a single read-only field card with label,
 *     value, optional helper, optional copy-to-clipboard, optional
 *     href, and a monospace mode for IDs / keys
 *   - `RecordActionBar` — a sticky-feel action rail with optional
 *     meta slot on the left and either a free-form `actions` ReactNode
 *     slot or a structured `actionItems[]` array using the
 *     `SharedHeaderActionDescriptor` shape from the shared
 *     header-actions helper
 *   - `RecordPanel` — a generic card-like container shared by detail
 *     pages for grouping unrelated content
 *
 * The family stays domain-agnostic. All labels, values, and helpers
 * are consumer-supplied; the components know nothing about tenants,
 * users, or any specific entity.
 *
 * Framework note: `RecordField` resolves its `href` rendering
 * through the `useNavigationLink()` hook from `runtime/navigation`.
 * Apps mount a `NavigationLinkProvider` once at their root layout and
 * pass their framework's Link primitive (e.g. Next.js's `Link`, Remix's
 * `Link`); the DS picks it up automatically. When no provider is
 * mounted the field falls back to a native `<a>` tag, which still
 * works for navigation but loses framework-specific features like
 * client-side transitions and prefetching. This keeps the DS package
 * framework-agnostic.
 *
 * @note Historical naming: this folder was called `surface-primitives`
 * before Checkpoint C of the 2026-04-08 audit and the identifiers
 * started with the `Surface…` prefix (`SurfaceSummaryStrip`,
 * `SurfaceFieldGrid`, `SurfaceReadField`, `SurfaceActionFooter`,
 * `SurfacePanel`). Checkpoint D promoted the canonical names to the
 * `Record…` prefix and demoted the old names to compat aliases
 * declared at the bottom of this file. Those aliases stay in place
 * until all known consumers have migrated (scheduled for removal in
 * Checkpoint F if no consumers remain).
 */

import { type CSSProperties, type ReactNode } from 'react';

import { ArrowUpRight, Copy } from 'lucide-react';

import { Box, Button, Flex, Stack, Text, Tooltip } from '../../primitives';
import { useNavigationLink } from '../../../runtime/navigation';
import {
  type SharedHeaderActionDescriptor,
  resolveSharedHeaderActionIcon,
  resolveSharedHeaderActionTooltip,
  resolveSharedHeaderActionVariant,
} from '../../patterns/_internal/header-actions';

const surfaceBackground = 'var(--ds-surface-card, var(--ds-color-bg-elevated))';
const fieldBackground = 'color-mix(in srgb, var(--ds-color-bg-secondary) 88%, transparent)';
const borderColor = 'var(--ds-color-border-secondary)';
const mutedText = 'var(--ds-color-text-muted)';
const secondaryText = 'var(--ds-color-text-secondary)';
const primaryText = 'var(--ds-color-text-primary)';
const tertiaryText = 'var(--ds-color-text-tertiary)';

export interface RecordSummaryItem {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  mono?: boolean;
}

export interface RecordActionItem extends SharedHeaderActionDescriptor {
  htmlType?: 'button' | 'submit' | 'reset';
}

export function RecordSummaryStrip({
  items,
  variant = 'default',
  style,
}: {
  items: RecordSummaryItem[];
  variant?: 'default' | 'editorial' | 'technical' | 'governance' | 'metrics';
  style?: CSSProperties;
}) {
  const visibleItems = items.filter((item) => item.value !== undefined && item.value !== null && item.value !== '');

  const variantStyles = {
    default: {
      background: fieldBackground,
      border: borderColor,
      labelColor: mutedText,
      valueColor: primaryText,
      helperColor: secondaryText,
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      padding: 18,
      gap: 16,
    },
    editorial: {
      background: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-primary) 12%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-secondary) 90%, transparent) 100%)',
      border: 'color-mix(in srgb, var(--ds-color-border-secondary) 82%, var(--ds-color-bg-primary) 18%)',
      labelColor: 'var(--ds-color-text-secondary)',
      valueColor: primaryText,
      helperColor: secondaryText,
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      padding: 18,
      gap: 16,
    },
    technical: {
      background: 'color-mix(in srgb, var(--ds-color-bg-secondary) 94%, transparent)',
      border: 'color-mix(in srgb, var(--ds-color-border-secondary) 84%, var(--ds-color-text-muted) 16%)',
      labelColor: 'var(--ds-color-text-muted)',
      valueColor: primaryText,
      helperColor: secondaryText,
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      padding: 18,
      gap: 16,
    },
    governance: {
      background: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-primary) 18%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-secondary) 94%, transparent) 100%)',
      border: 'color-mix(in srgb, var(--ds-color-border) 62%, var(--ds-color-bg-primary) 38%)',
      labelColor: 'color-mix(in srgb, var(--ds-color-text-primary) 26%, var(--ds-color-text-muted) 74%)',
      valueColor: primaryText,
      helperColor: secondaryText,
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      padding: 18,
      gap: 16,
    },
    metrics: {
      background: 'color-mix(in srgb, var(--ds-color-bg-primary) 18%, var(--ds-color-bg-secondary) 82%)',
      border: borderColor,
      labelColor: mutedText,
      valueColor: primaryText,
      helperColor: secondaryText,
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      padding: 20,
      gap: 18,
    },
  }[variant];

  if (!visibleItems.length) {
    return null;
  }

  return (
    <Box
      style={{
        width: '100%',
        borderRadius: 18,
        border: `1px solid ${variantStyles.border}`,
        background: variantStyles.background,
        padding: variantStyles.padding,
        ...style,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: variantStyles.gridTemplateColumns,
          gap: variantStyles.gap,
        }}
      >
        {visibleItems.map((item) => (
          <Stack key={item.label} spacing={4} style={{ minWidth: 0 }}>
            <Text
              size="xs"
              weight="bold"
              style={{
                color: variantStyles.labelColor,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontFamily: 'var(--ds-font-family-mono, monospace)',
              }}
            >
              {item.label}
            </Text>
            <Text
              size={variant === 'metrics' ? 'md' : 'sm'}
              weight="medium"
              style={{
                color: variantStyles.valueColor,
                wordBreak: 'break-word',
                fontFamily: item.mono ? 'var(--ds-font-family-mono, monospace)' : undefined,
                fontSize: variant === 'metrics' ? 16 : undefined,
              }}
            >
              {item.value}
            </Text>
            {item.helper ? (
              <Text size="xs" style={{ color: variantStyles.helperColor, lineHeight: 1.5 }}>
                {item.helper}
              </Text>
            ) : null}
          </Stack>
        ))}
      </Box>
    </Box>
  );
}

export function RecordFieldGrid({
  children,
  columns = 'repeat(2, minmax(0, 1fr))',
  style,
}: {
  children: ReactNode;
  columns?: string;
  style?: CSSProperties;
}) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: columns,
        gap: 14,
        width: '100%',
        alignItems: 'start',
        ...style,
      }}
    >
      {children}
    </Box>
  );
}

function renderFieldValue(value: ReactNode, emptyLabel: string) {
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized || normalized === '-' || normalized === '—' || normalized.toLowerCase() === 'n/a') {
      return {
        content: emptyLabel,
        empty: true,
      };
    }

    return {
      content: normalized,
      empty: false,
    };
  }

  if (typeof value === 'number') {
    return {
      content: String(value),
      empty: false,
    };
  }

  if (value === undefined || value === null || value === '') {
    return {
      content: emptyLabel,
      empty: true,
    };
  }

  return {
    content: value,
    empty: false,
  };
}

export function RecordField({
  label,
  value,
  mono = false,
  span = 1,
  emptyLabel = 'Not set',
  helper,
  href,
  copyValue,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  span?: number;
  emptyLabel?: string;
  helper?: ReactNode;
  href?: string;
  copyValue?: string;
}) {
  const NavLink = useNavigationLink();
  const resolved = renderFieldValue(value, emptyLabel);
  const primitiveValue = typeof resolved.content === 'string' || typeof resolved.content === 'number';
  const valueNode = primitiveValue ? (
    <Text
      size="sm"
      weight="medium"
      style={{
        color: resolved.empty ? tertiaryText : primaryText,
        fontFamily: mono ? 'var(--ds-font-family-mono, monospace)' : undefined,
        wordBreak: mono ? 'break-all' : 'break-word',
        lineHeight: 1.6,
      }}
    >
      {resolved.content}
    </Text>
  ) : (
    resolved.content
  );

  // When an `href` is provided we want client-side routing if the consuming
  // app supplied a Link adapter via NavigationLinkProvider (e.g. Next.js's
  // <Link>); otherwise we degrade gracefully to a native <a>. This keeps
  // the DS framework-agnostic while preserving Next.js-style routing /
  // prefetching at all RecordField call sites where the provider is
  // mounted.
  const linkInner = (
    <Flex align="center" gap={8} wrap="wrap" style={{ width: 'fit-content' }}>
      {valueNode}
      <ArrowUpRight style={{ width: 13, height: 13, color: mutedText }} />
    </Flex>
  );

  const maybeLinkedValue =
    href && !resolved.empty ? (
      NavLink ? (
        <NavLink href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
          {linkInner}
        </NavLink>
      ) : (
        <a href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
          {linkInner}
        </a>
      )
    ) : (
      valueNode
    );

  return (
    <Box
      style={{
        gridColumn: `span ${span}`,
        minWidth: 0,
        padding: '12px 14px',
        borderRadius: 14,
        border: `1px solid ${mono ? 'var(--ds-color-border)' : borderColor}`,
        background: mono
          ? 'color-mix(in srgb, var(--ds-color-bg-primary) 18%, var(--ds-color-bg-secondary) 82%)'
          : fieldBackground,
      }}
    >
      <Stack spacing={6}>
        <Text
          size="xs"
          weight="bold"
          style={{
            color: mutedText,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'var(--ds-font-family-mono, monospace)',
          }}
        >
          {label}
        </Text>

        <Flex align="start" justify="between" gap={12}>
          <Box style={{ minWidth: 0, flex: 1 }}>{maybeLinkedValue}</Box>
          {copyValue ? (
            <Tooltip content={`Copy ${label.toLowerCase()}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(copyValue)}
                style={{ flexShrink: 0 }}
                aria-label={`Copy ${label.toLowerCase()}`}
              >
                <Copy style={{ width: 13, height: 13 }} />
              </Button>
            </Tooltip>
          ) : null}
        </Flex>

        {helper ? (
          <Text size="xs" style={{ color: secondaryText, lineHeight: 1.5 }}>
            {helper}
          </Text>
        ) : null}
      </Stack>
    </Box>
  );
}

export function RecordActionBar({
  meta,
  actions,
  actionItems,
  style,
}: {
  meta?: ReactNode;
  actions?: ReactNode;
  actionItems?: RecordActionItem[];
  style?: CSSProperties;
}) {
  const resolvedActionItems = actionItems?.filter(Boolean) || [];
  const renderedActions =
    resolvedActionItems.length > 0
      ? resolvedActionItems.map((action, index) => {
          const ActionIcon = resolveSharedHeaderActionIcon(action);

          return (
            <Tooltip key={`${action.label}-${index}`} content={resolveSharedHeaderActionTooltip(action)}>
              <Button
                variant={resolveSharedHeaderActionVariant(action)}
                size="sm"
                htmlType={action.htmlType}
                icon={ActionIcon ? <ActionIcon style={{ width: 14, height: 14 }} /> : undefined}
                onClick={action.onClick}
                href={action.href}
                loading={action.loading}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            </Tooltip>
          );
        })
      : actions;

  return (
    <Flex
      justify="between"
      align="end"
      gap={16}
      wrap="wrap"
      style={{
        paddingTop: 14,
        borderTop: `1px solid ${borderColor}`,
        backgroundImage: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 34%, transparent) 0%, transparent 100%)',
        backgroundSize: '100% 100%',
        backgroundPosition: '0 0',
        ...style,
      }}
    >
      <Box style={{ minWidth: 0, flex: 1 }}>
        {typeof meta === 'string' ? (
          <Stack spacing={4}>
            <Text
              size="xs"
              weight="bold"
              style={{
                color: tertiaryText,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--ds-font-family-mono, monospace)',
              }}
            >
              Action rail
            </Text>
            <Text size="sm" style={{ color: mutedText, lineHeight: 1.6 }}>
              {meta}
            </Text>
          </Stack>
        ) : (
          meta
        )}
      </Box>
      <Flex gap={12} wrap="wrap" style={{ justifyContent: 'flex-end' }}>
        {renderedActions}
      </Flex>
    </Flex>
  );
}

export function RecordPanel({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Box
      style={{
        width: '100%',
        borderRadius: 18,
        border: `1px solid ${borderColor}`,
        background: surfaceBackground,
        padding: 18,
        ...style,
      }}
    >
      {children}
    </Box>
  );
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical Record* names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export {
  RecordSummaryStrip as SurfaceSummaryStrip,
  RecordFieldGrid as SurfaceFieldGrid,
  RecordField as SurfaceReadField,
  RecordActionBar as SurfaceActionFooter,
  RecordPanel as SurfacePanel,
};
export type {
  RecordSummaryItem as SurfaceSummaryItem,
  RecordActionItem as SurfaceActionFooterItem,
};
