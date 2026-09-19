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
 * STATES (C-12): `loading` renders the shared anatomy-derived skeleton — the
 * resolved chrome is built once, mirrored bone-for-part, and inert under the
 * bones, so no control acts on placeholder content; `error` renders the
 * semantic status icon plus copy, never colour alone. An empty value keeps the
 * deliberate `data-empty` placeholder, which the skin expresses as a dashed
 * frame — a shape cue, not a tint. Hover and focus-within paint is the shared
 * kernel's decision, read off `data-state` on the field root.
 *
 * INLINE BOUNDARY: the caller's runtime `span` is the ONE legal inline write —
 * the `--ds-record-field-span` channel the skin's single arm reads (the grid's
 * `columns` precedent). Instance geometry that carries an arbitrary number
 * cannot be a finite selector list: an arm per value silently drops every
 * number past the last arm. `data-span` stays the stamp callers and tests read.
 * The linked-value cluster's fit-content measure and the link arrow's 13px
 * frame live in the skin. The grid-columns default is skin-authored on the
 * grid.
 *
 * Framework note: `href` rendering resolves through the `useNavigationLink()`
 * hook from `runtime/adapters/navigation`. Apps mount a
 * `NavigationLinkProvider` once at their root layout and pass their framework's
 * Link primitive (e.g. Next.js's `Link`, Remix's `Link`); the DS picks it up
 * automatically. With no provider mounted the field falls back to a native
 * `<a>`, which still navigates but loses client-side transitions and
 * prefetching. This keeps the DS package framework-agnostic. The injected
 * Link's contract admits no `data-*` attributes, so the link's hover, press
 * and keyboard ring all paint on the surface-owned `field-link-body` wrapper,
 * stamped by its own interaction state. The wrapper WRAPS the anchor instead
 * of sitting inside it: focus bubbles up, so an ancestor is the only place
 * that can hold the focusable element's state, and the skin's `fit-content`
 * measure keeps that ancestor's box the anchor's box.
 *
 * @see `../index.ts` for the record family narrative and the pre-Checkpoint-D
 * `Surface*` compatibility aliases.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import {
  ArrowUpRightIcon as ArrowUpRight,
} from '../../../../graphics/icons';
import { StatusErrorIcon } from '@/graphics/icons/semantic/generated/roles/status-error';
import { CopyToCheck } from '../../../../graphics/motion';

import { Box } from '../../../primitives/layout/box';
import { Button } from '../../../primitives/inputs/button';
import { Flex } from '../../../primitives/layout/flex';
import { Stack } from '../../../primitives/layout/stack';
import { Text } from '../../../primitives/display/typography/compound/text';
import { Tooltip } from '../../../primitives/display/tooltip';
import { AnatomySkeleton } from '../../../primitives/feedback/skeleton/runtime/anatomy-renderer';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { useNavigationLink } from '../../../../infrastructure/runtime/adapters/presentation/react/navigation';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { writeClipboard } from '@/infrastructure/runtime/application/data/foundation/export-kernel';

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useRecordTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;
  return { tOr };
}

/** The published `span` domain is every positive integer; anything else is not
    a geometry the grid can place, so it resolves to the single-track default. */
function resolveFieldSpan(span: number): number {
  return Number.isFinite(span) && span >= 1 ? Math.floor(span) : 1;
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
  /** Mirrors the resolved chrome with the shared anatomy-derived skeleton
      while the field's data resolves; the affordances render inert under the
      bones, so no control acts on placeholder content. */
  loading?: boolean;
  /** Per-field error copy (consumer-supplied). Rendered with the semantic
      `status.error` icon and the error ink — the state never reads through
      colour alone. */
  error?: ReactNode;
}) {
  const NavLink = useNavigationLink();
  const { tOr } = useRecordTranslation();
  const resolvedEmptyLabel = emptyLabel ?? tOr('record.notSet', 'Not set');

  /* Hover, press and focus-within on the card are decided once, by the shared
     kernel, and the skin reads them off `data-state`. Focus events bubble, so
     `focused` here IS focus-within semantics: the keyboard path into the copy
     button or the linked value reads the same state. */
  const fieldInteraction = useInteractionState();
  /* The linked-value cluster owns its own affordance paint. The anchor may be
     an app-injected Link whose contract admits no event handlers or `data-*`
     attributes, so the state is read on the surface-owned wrapper instead. */
  const linkInteraction = useInteractionState();

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
    void writeClipboard(copyValue);
    setCopied(true);
    if (copyRevertTimer.current) clearTimeout(copyRevertTimer.current);
    copyRevertTimer.current = setTimeout(() => setCopied(false), 1400);
  }, [copyValue]);

  /* The span rides its own channel rather than an arm per value: a single
     skin rule reads it, so no number falls off the end of a selector list. */
  const resolvedSpan = resolveFieldSpan(span);

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
  /* The cluster's row — value beside arrow — is the anchor's own content, so
     the ANCHOR is the row: its class hook carries the skin's flex layout. A
     layout `Flex` here would stamp a second nameless `data-part='root'` inside
     the field for geometry the skin already owns. */
  const linkCluster = (
    <>
      {valueNode}
      <ArrowUpRight data-part="field-link-icon" />
    </>
  );

  // `NavigationLinkProps` accepts `className` but not `data-part`, and a
  // consumer-supplied Link adapter is not this component's DOM: the anchor's
  // skin hook is therefore its class, not a part.
  const renderAnchor = (target: string) =>
    NavLink ? (
      <NavLink className="ds-record__field-link" href={target}>
        {linkCluster}
      </NavLink>
    ) : (
      <a className="ds-record__field-link" href={target}>
        {linkCluster}
      </a>
    );

  const maybeLinkedValue =
    href && !resolved.empty ? (
      /* Geometry and interaction paint live in the skin on this surface-owned
         wrapper, which WRAPS the anchor rather than sitting inside it. That
         containment is the whole point: focus bubbles up, so only an ancestor
         of the focusable element can carry its `focus-visible` state, and the
         cluster's `inline-size: fit-content` keeps the wrapper's box the
         anchor's box, so hover and press keep the geometry they had. */
      <Flex
        {...linkInteraction.handlers}
        {...partAttributes('field-link-body', linkInteraction.state)}
      >
        {renderAnchor(href)}
      </Flex>
    ) : (
      valueNode
    );

  const chrome = (
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
    </Stack>
  );

  return (
    <Box
      {...fieldInteraction.handlers}
      {...partAttributes('field', fieldInteraction.state)}
      className="ds-structure ds-record"
      data-structure="record"
      data-span={resolvedSpan}
      style={
        resolvedSpan > 1
          ? ({ '--ds-record-field-span': String(resolvedSpan) } as CSSProperties)
          : undefined
      }
      data-empty={resolved.empty}
      data-mono={mono}
      data-loading={loading ? 'true' : undefined}
      data-error={error ? 'true' : undefined}
      aria-busy={loading ? true : undefined}
    >
      {/* The loading state is built from the anatomy, not hand-written: the
          shared renderer reads the chrome's own `data-part` tree and draws one
          bone per part, so the wait has the shape of the field it stands in
          for. The root keeps the announcement (`aria-busy`), so the skeleton
          is told not to announce a second time. */}
      {loading ? <AnatomySkeleton busy={false}>{chrome}</AnatomySkeleton> : chrome}
    </Box>
  );
}
