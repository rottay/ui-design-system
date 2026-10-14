import React from 'react';
import type { ReactNode } from 'react';
import type { ColumnDef } from '../../../../../../../../foundation/contracts/runtime/components/patterns/core';
import type { UseFormatterResult } from '@/infrastructure/runtime/i18n';
import { Box } from '../../../../../../../primitives/layout/box';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { Text } from '../../../../../../../primitives/display/typography';
import { Button } from '../../../../../../../primitives/inputs/button';
import { NavLink } from '../../../../../../../primitives/navigation/link';
import {
  getColumnHeader,
  readCollectionRecordValue,
  type SurfaceTranslator,
} from '../foundation';

function getColumnValue<T extends object>(
  row: T,
  column: ColumnDef<T>,
  index: number,
  t: SurfaceTranslator,
  format: UseFormatterResult,
): ReactNode {
  const rawValue = column.accessorFn
    ? column.accessorFn(row)
    : column.accessorKey
      ? readCollectionRecordValue(row, column.accessorKey)
      : readCollectionRecordValue(row, column.key);

  if (column.render) {
    return column.render(rawValue, row, index);
  }

  if (rawValue == null || rawValue === '') {
    return t('collection_workspace.not_set', 'Not set');
  }
  // Locale-aware: the fallback card is the ONLY place this dispatch formats a
  // raw Date itself (the table view delegates cell rendering to the pattern).
  if (rawValue instanceof Date) return format.date(rawValue, { month: 'numeric' });
  if (typeof rawValue === 'boolean') {
    return rawValue
      ? t('collection_workspace.boolean_yes', 'Yes')
      : t('collection_workspace.boolean_no', 'No');
  }
  if (typeof rawValue === 'object') return JSON.stringify(rawValue);
  return String(rawValue);
}

const INTERACTIVE_CARD_TARGET_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'label',
  'option',
  'select',
  'textarea',
  'summary',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="link"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function isNestedInteractiveCardTarget(
  target: EventTarget | null,
  currentTarget: HTMLElement,
): boolean {
  if (!(target instanceof Element) || target === currentTarget) return false;
  const interactiveTarget = target.closest<HTMLElement>(INTERACTIVE_CARD_TARGET_SELECTOR);
  return Boolean(
    interactiveTarget
    && interactiveTarget !== currentTarget
    && currentTarget.contains(interactiveTarget),
  );
}

/**
 * A card row in cards mode. The press dip the skin paints on the fallback card
 * is one decision, so the kernel stamps it here and the skin's `:active` arm is
 * that decision's fallback; a hook cannot live in the render loop itself.
 */
export function CardItem({
  isLoneFinalCard,
  hasActivation,
  href,
  onActivate,
  children,
}: {
  isLoneFinalCard: boolean;
  hasActivation: boolean;
  href: string | undefined;
  onActivate: (event: React.MouseEvent<HTMLElement>) => void;
  children: ReactNode;
}) {
  const card = useInteractionState();
  return (
    <Box
      className="ds-collection-render-dispatch__card-item"
      {...partAttributes('card-item', card.state)}
      {...card.handlers}
      data-lone-final={isLoneFinalCard ? 'true' : 'false'}
      data-activatable={hasActivation ? 'true' : 'false'}
      data-href={href}
      onClick={onActivate}
    >
      {children}
    </Box>
  );
}

/** The fallback card's own open link: the Link primitive stamps the keyboard
 *  ring state the skin's governed focus channels key on. */
function FallbackOpenLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <NavLink
      className="ds-collection-render-dispatch__fallback-open-link"
      underline={false}
      href={href}
      aria-label={label}
    >
      {children}
    </NavLink>
  );
}

export function renderFallbackCard<T extends object>({
  row,
  index,
  columns,
  actions,
  href,
  activationLabel,
  onActivate,
  t,
  format,
}: {
  row: T;
  index: number;
  columns: ColumnDef<T>[];
  actions?: (row: T, index: number) => ReactNode;
  href?: string;
  activationLabel: string;
  onActivate?: () => void;
  t: SurfaceTranslator;
  format: UseFormatterResult;
}): ReactNode {
  const visibleColumns = columns
    .filter((column) => column.visible !== false)
    .slice(0, 6);
  const [primaryColumn, ...detailColumns] = visibleColumns;
  const primaryValue = primaryColumn
    ? getColumnValue(row, primaryColumn, index, t, format)
    : t('collection_workspace.record_number', 'Record {index}', { index: index + 1 });
  const actionContent = actions?.(row, index);

  return (
    <Box
      className="ds-collection-render-dispatch__fallback-card"
      data-part="fallback-card"
    >
      <Box className="ds-collection-render-dispatch__fallback-heading">
        <Text
          className="ds-collection-render-dispatch__muted-text ds-collection-render-dispatch__fallback-label"
          size="xs"
        >
          {primaryColumn
            ? getColumnHeader(primaryColumn as ColumnDef<unknown>)
            : t('collection_workspace.record_label', 'Record')}
        </Text>
        <Text
          className="ds-collection-render-dispatch__fallback-title ds-collection-render-dispatch__title"
          weight="semibold"
        >
          {primaryValue}
        </Text>
      </Box>

      <Box
        className="ds-collection-render-dispatch__fallback-grid"
        data-part="fallback-grid"
      >
        {detailColumns.slice(0, 4).map((column) => (
          <Box key={column.key} className="ds-collection-render-dispatch__fallback-field">
            <Text
              className="ds-collection-render-dispatch__muted-text ds-collection-render-dispatch__fallback-label"
              size="xs"
            >
              {getColumnHeader(column as ColumnDef<unknown>)}
            </Text>
            <Text
              className="ds-collection-render-dispatch__fallback-value"
              size="sm"
            >
              {getColumnValue(row, column, index, t, format)}
            </Text>
          </Box>
        ))}
      </Box>

      {actionContent || href || onActivate ? (
        <Box
          className="ds-collection-render-dispatch__fallback-actions"
          data-part="fallback-actions"
          onClick={(event) => event.stopPropagation()}
        >
          {actionContent}
          {href ? (
            <FallbackOpenLink href={href} label={activationLabel}>
              {t('collection_workspace.open_details', 'Open details')}
            </FallbackOpenLink>
          ) : onActivate ? (
            <Button
              variant="ghost"
              size="sm"
              className="ds-collection-render-dispatch__fallback-open-link"
              aria-label={activationLabel}
              onClick={onActivate}
            >
              {t('collection_workspace.open_details', 'Open details')}
            </Button>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

/** Number of skeleton cards rendered while the cards grid loads. */
export const CARDS_SKELETON_COUNT = 6;

/**
 * Resolves the cards grid template. Kept as a single source so the loading
 * skeleton mirrors the ready grid exactly (no layout shift on swap). The
 * resolved template stays an inline style: instance column counts are true
 * per-instance geometry and tests pin the inline declaration.
 */
export function resolveCardsGridTemplateColumns(
  cardColumns: number | 'auto' | undefined,
): string {
  if (cardColumns) {
    return cardColumns === 'auto'
      ? 'repeat(auto-fill, minmax(var(--ds-listing-grid-min-card-width, 280px), 1fr))'
      : `repeat(${cardColumns}, minmax(0, 1fr))`;
  }
  return 'var(--ds-listing-grid-columns, repeat(auto-fill, minmax(var(--ds-listing-grid-min-card-width, 280px), 1fr)))';
}
