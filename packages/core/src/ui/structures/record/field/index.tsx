'use client';

/**
 * @fileoverview RecordField — a single read-only field card: label, value,
 * optional helper, optional copy-to-clipboard, optional href, a monospace mode
 * for IDs and keys, a `loading` skeleton state and a per-field `error` state.
 *
 * OWNED COPY rides the optional `components` i18n channel with English floors
 * (`record.notSet`, `record.copyField`, `record.copiedField`); the copy
 * aria-label floors keep the exact `Copy {label}` / `Copied {label}` templates
 * the copy-confirm tests pin.
 *
 * STATES (C-12): `loading` reserves the final label/value footprint with
 * skeleton bars while the copy/link affordances stay unmounted, so no control
 * acts on placeholder content; `error` renders the semantic status icon plus
 * copy, never colour alone. An empty value keeps the deliberate `data-empty`
 * placeholder, which the skin expresses as a dashed frame — a shape cue, not a
 * tint.
 *
 * INLINE BOUNDARY: the only inline value is the runtime `grid-column: span N`.
 * The linked-value cluster's fit-content measure and the link arrow's 13px
 * frame live in the skin.
 *
 * Framework note: `href` rendering resolves through the `useNavigationLink()`
 * hook from `runtime/adapters/navigation`. Apps mount a
 * `NavigationLinkProvider` once at their root layout and pass their framework's
 * Link primitive (e.g. Next.js's `Link`, Remix's `Link`); the DS picks it up
 * automatically. With no provider mounted the field falls back to a native
 * `<a>`, which still navigates but loses client-side transitions and
 * prefetching. This keeps the DS package framework-agnostic.
 *
 * @see `../index.ts` for the record family narrative and the pre-Checkpoint-D
 * `Surface*` compatibility aliases.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import {
  ArrowUpRightIcon as ArrowUpRight,
} from '../../../../graphics/icons';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { CopyToCheck } from '../../../../graphics/motion';

import { Box } from '../../../primitives/layout/Box';
import { Button } from '../../../primitives/inputs/Button';
import { Flex } from '../../../primitives/layout/Flex';
import { Skeleton } from '../../../primitives/feedback/Skeleton';
import { Stack } from '../../../primitives/layout/Stack';
import { Text } from '../../../primitives/display/Typography/compound/Text';
import { Tooltip } from '../../../primitives/display/Tooltip';
import { useNavigationLink } from '../../../../infrastructure/runtime/adapters/presentation/react/navigation';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useRecordTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;
  return { tOr };
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
  loading = false,
  error,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  span?: number;
  emptyLabel?: string;
  helper?: ReactNode;
  href?: string;
  copyValue?: string;
  /** Reserves the final label/value footprint with skeleton bars while the
      field's data resolves; the copy/link affordances stay unmounted so no
      control acts on placeholder content. */
  loading?: boolean;
  /** Per-field error copy (consumer-supplied). Rendered with the semantic
      `status.error` icon and the error ink — the state never reads through
      colour alone. */
  error?: ReactNode;
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
      data-loading={loading ? 'true' : undefined}
      data-error={error ? 'true' : undefined}
      aria-busy={loading ? true : undefined}
      /* grid-column stays inline: runtime `span` prop. */
      style={{
        gridColumn: `span ${span}`,
      }}
    >
      <Stack spacing={6}>
        {loading ? (
          <>
            {/* Loading keeps the read hierarchy: a short label bar above a
                wider value bar, so the resolving content lands on the same
                footprint. */}
            <Box data-part="field-skeleton-label">
              <Skeleton variant="rounded" width="9em" height="0.7rem" />
            </Box>
            <Box data-part="field-skeleton-value">
              <Skeleton variant="rounded" width="72%" height="0.9rem" />
            </Box>
          </>
        ) : (
          <>
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

            {error ? (
              <Flex data-part="field-error-row" align="start" gap={6}>
                {/* Decorative: the adjacent copy carries the error meaning;
                    the icon is the non-colour shape cue. */}
                <StatusErrorIcon decorative size={13} data-part="field-error-icon" />
                <Text data-part="field-error" size="xs">
                  {error}
                </Text>
              </Flex>
            ) : null}
          </>
        )}
      </Stack>
    </Box>
  );
}
