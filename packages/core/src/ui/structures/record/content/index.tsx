'use client';

/**
 * @fileoverview record — a suite of generic record-page building blocks
 * (summary strip, field grid, read field, action footer, panel) used by
 * detail, edit, and form pages.
 *
 * @description
 * Structures companion to `form-sections`. The two families ship
 * together because many consumers compose them: a top-level summary
 * strip, then a stack of form-sections, then a read-field grid inside
 * one of those sections, then an action footer at the bottom.
 *
 * ANATOMY (Pass 1, documented): there are no tabs, collapsible sections,
 * main+aside layout, or skeleton loading in THIS family — those live in
 * the sibling `form-sections` / detail-panel grammars. The blocks here
 * are the summary strip, the read-field grid + field, the action bar and
 * the panel. Scroll ownership: the page scrolls; no block owns a scroll
 * frame.
 *
 * OWNED COPY rides the optional `components` i18n channel with English
 * floors (`record.notSet`, `record.copyField`, `record.copiedField`,
 * `record.actionRail`); the copy aria-label floors keep the exact
 * `Copy {label}` / `Copied {label}` templates the copy-confirm tests pin.
 *
 * SPECIFICITY HOOK: every block root stamps `data-structure='record'` as
 * its always-present attribute, so the skin can buy the (0,4,0) border
 * floor without ever repeating a class or an attribute.
 *
 * INLINE BOUNDARY: the only inline styles left are runtime-computed
 * values (the field-grid `gridTemplateColumns` prop, the field's
 * `grid-column: span N`, consumer `style` passthrough) and the copy
 * timer state. All static geometry lives in
 * `presentation/components/skin/record.css` — including the linked-value
 * cluster's fit-content measure and the link arrow's 13px frame (drained
 * from inline icon sizing). Action-bar icons take the Button's governed
 * icon channel (`--ds-button-sm-icon-size`) instead of an inline 14px
 * override, so tenant icon sizing reaches the rail.
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
 * through the `useNavigationLink()` hook from `runtime/adapters/navigation`.
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

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import {
  ArrowUpRightIcon as ArrowUpRight,
} from '../../../../graphics/icons';
import { CopyToCheck } from '../../../../graphics/motion';

import { Box, Button, Flex, Stack, Text, Tooltip } from '../../../primitives';
import { useNavigationLink } from '../../../../infrastructure/runtime/adapters/presentation/react/navigation';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import {
  type SharedHeaderActionDescriptor,
  resolveSharedHeaderActionIcon,
  resolveSharedHeaderActionTooltip,
  resolveSharedHeaderActionVariant,
} from '../../../patterns/foundation/header-actions';

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useRecordTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;
  return { tOr };
}

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

  if (!visibleItems.length) {
    return null;
  }

  return (
    <Box
      className="ds-structure ds-record"
      data-part="summary-strip"
      data-structure="record"
      data-variant={variant}
      style={style}
    >
      {/* Grid rhythm + per-variant columns/padding/gap are skin-owned off
          data-variant (they were an inline variantStyles map). */}
      <Box data-part="summary-grid">
        {visibleItems.map((item) => (
          <Stack key={item.label} data-part="summary-item" spacing={4}>
            <Text
              data-part="summary-item-label"
              size="xs"
              weight="bold"
            >
              {item.label}
            </Text>
            <Text
              data-part="summary-item-value"
              data-mono={item.mono ? 'true' : undefined}
              size={variant === 'metrics' ? 'md' : 'sm'}
              weight="medium"
            >
              {item.value}
            </Text>
            {item.helper ? (
              <Text data-part="summary-item-helper" size="xs">
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
  /* The default is intrinsic: tracks auto-fit a 16rem minimum measure, so a
     narrow container re-flows 2→1 columns and long labels/values never force
     an overflow. A caller's explicit `columns` always wins (runtime prop). */
  columns = 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
  style,
}: {
  children: ReactNode;
  columns?: string;
  style?: CSSProperties;
}) {
  return (
    <Box
      className="ds-structure ds-record"
      data-part="field-grid"
      data-structure="record"
      /* gridTemplateColumns stays inline: it is the caller's runtime `columns`
         prop. Display/gap/alignment are skin-owned. */
      style={{
        gridTemplateColumns: columns,
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
  emptyLabel,
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
  const { tOr } = useRecordTranslation();
  const resolvedEmptyLabel = emptyLabel ?? tOr('record.notSet', 'Not set');

  // Copy-to-clipboard confirm feedback: the icon morphs copy -> check on click,
  // then reverts. CopyToCheck is opacity/transform-only and honors reduced
  // motion (crossfade collapses to an instant swap), so no bespoke guard here.
  const [copied, setCopied] = useState(false);
  const copyRevertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyRevertTimer.current) clearTimeout(copyRevertTimer.current);
    },
    [],
  );
  const handleCopy = useCallback(() => {
    if (!copyValue) return;
    void navigator.clipboard?.writeText(copyValue);
    setCopied(true);
    if (copyRevertTimer.current) clearTimeout(copyRevertTimer.current);
    copyRevertTimer.current = setTimeout(() => setCopied(false), 1400);
  }, [copyValue]);

  const resolved = renderFieldValue(value, resolvedEmptyLabel);
  const primitiveValue = typeof resolved.content === 'string' || typeof resolved.content === 'number';
  const valueNode = primitiveValue ? (
    <Text
      data-part="field-value"
      size="sm"
      weight="medium"
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
    /* Geometry lives in the skin: the cluster hugs its content
       (`inline-size: fit-content`) and the arrow takes its 13px frame from
       the `field-link-icon` rule — no inline sizing. */
    <Flex align="center" gap={8} wrap="wrap" data-part="field-link-body">
      {valueNode}
      <ArrowUpRight data-part="field-link-icon" />
    </Flex>
  );

  // `NavigationLinkProps` accepts `className` but not `data-part`, and a
  // consumer-supplied Link adapter is not this component's DOM: the anchor's
  // skin hook is therefore its class, not a part.
  const maybeLinkedValue =
    href && !resolved.empty ? (
      NavLink ? (
        <NavLink className="ds-record__field-link" href={href}>
          {linkInner}
        </NavLink>
      ) : (
        <a className="ds-record__field-link" href={href}>
          {linkInner}
        </a>
      )
    ) : (
      valueNode
    );

  return (
    <Box
      className="ds-structure ds-record"
      data-part="field"
      data-structure="record"
      data-empty={resolved.empty}
      data-mono={mono}
      /* grid-column stays inline: runtime `span` prop. */
      style={{
        gridColumn: `span ${span}`,
      }}
    >
      <Stack spacing={6}>
        <Text
          data-part="field-label"
          size="xs"
          weight="bold"
        >
          {label}
        </Text>

        <Flex align="start" justify="between" gap={12}>
          <Box data-part="field-body">{maybeLinkedValue}</Box>
          {copyValue ? (
            <Tooltip content={copied ? tOr('record.copiedField', 'Copied {label}', { label: label.toLowerCase() }) : tOr('record.copyField', 'Copy {label}', { label: label.toLowerCase() })}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                data-part="field-copy"
                aria-label={copied ? tOr('record.copiedField', 'Copied {label}', { label: label.toLowerCase() }) : tOr('record.copyField', 'Copy {label}', { label: label.toLowerCase() })}
              >
                <CopyToCheck copied={copied} size={13} />
              </Button>
            </Tooltip>
          ) : null}
        </Flex>

        {helper ? (
          <Text data-part="field-helper" size="xs">
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
  const { tOr } = useRecordTranslation();
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
                /* Icon geometry rides the Button's governed icon channel
                   (`--ds-button-sm-icon-size`), not an inline override. */
                icon={ActionIcon ? <ActionIcon /> : undefined}
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
      className="ds-structure ds-record"
      data-part="action-bar"
      data-structure="record"
      justify="between"
      align="end"
      gap={16}
      wrap="wrap"
      style={style}
    >
      <Box data-part="action-bar-meta">
        {typeof meta === 'string' ? (
          <Stack spacing={4}>
            <Text
              data-part="action-bar-meta-label"
              size="xs"
              weight="bold"
            >
              {tOr('record.actionRail', 'Action rail')}
            </Text>
            <Text data-part="action-bar-meta-text" size="sm">
              {meta}
            </Text>
          </Stack>
        ) : (
          meta
        )}
      </Box>
      <Flex data-part="action-bar-actions" gap={12} wrap="wrap">
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
      className="ds-structure ds-record"
      data-part="panel"
      data-structure="record"
      style={style}
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
