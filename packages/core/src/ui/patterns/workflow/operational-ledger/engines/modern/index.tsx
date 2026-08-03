'use client';

/**
 * @fileoverview Modern (token-driven) engine for the OperationalLedger pattern.
 * Renders a REAL `<table>` (thead/tbody, `scope="col"` headers) so the ledger
 * scans with native table semantics: tabular signed quantities (the ± sign is
 * the non-colour direction cue, tone only reinforces), locale timestamps,
 * actor attribution, monospace references and an inline type filter composed
 * from the Select primitive — never a recreation.
 *
 * ADAPTIVE LAW: low-priority columns (actor / reason / reference) collapse
 * under the named `ds-operational-ledger` inline-size container; the header
 * stays sticky when its family-private region cap enables internal scrolling.
 *
 * COPY: all strings resolve through the optional `components` i18n channel
 * with a documented English floor.
 *
 * @example
 * <ModernOperationalLedger
 *   entries={[{ id: '1', timestamp: '2026-03-18T10:00:00Z',
 *     description: 'Stock received', quantity: 50, type: 'credit',
 *     actor: 'Warehouse Bot', reason: 'PO-1234' }]}
 *   filters={{ types: ['credit'] }}
 *   onFilter={(f) => setFilters(f)}
 * />
 */

import type { OperationalLedgerProps, LedgerEntry, LedgerFilter } from '../../contracts';
import ModernSelect from '../../../../../primitives/inputs/Select/engines/modern';
import { ModernEmptyState } from '../../../../facade';
import { VisuallyHidden } from '../../../../../primitives/foundation/VisuallyHidden';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Formats an ISO timestamp to a compact, locale-aware date/time string. */
function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Signed display string: the ± sign is the direction cue (never colour-only). */
function formatQuantity(entry: LedgerEntry): string {
  const sign = entry.type === 'credit' ? '+' : '−';
  return `${sign}${entry.quantity.toLocaleString()}`;
}

/** Column model: priority 'low' columns collapse first on narrow containers. */
const COLUMNS: Array<{ key: string; priority?: 'low' }> = [
  { key: 'timestamp' },
  { key: 'description' },
  { key: 'quantity' },
  { key: 'actor', priority: 'low' },
  { key: 'reason', priority: 'low' },
  { key: 'reference', priority: 'low' },
];

const COLUMN_FLOOR: Record<string, string> = {
  timestamp: 'Timestamp',
  description: 'Description',
  quantity: 'Quantity',
  actor: 'Actor',
  reason: 'Reason',
  reference: 'Reference',
};

/**
 * Modern engine for the OperationalLedger pattern (see the module docblock).
 *
 * @param props - {@link OperationalLedgerProps}
 * @returns A scannable ledger table with an inline type filter.
 */
export default function ModernOperationalLedger(props: OperationalLedgerProps) {
  const translation = useOptionalTranslation('components');
  const t = (key: string, floor: string, params?: Record<string, string | number>): string =>
    translation?.tOr(key, floor, params) ?? floor;

  const {
    entries,
    filters,
    onFilter,
    emptyMessage,
    loading,
    className,
    style,
  } = props;

  const rootClassName = ['ds-pattern-operational-ledger', 'ds-engine-modern', className]
    .filter(Boolean)
    .join(' ');

  /* Skeleton keeps the table footprint (header bar + uniform rows). */
  if (loading) {
    return (
      <div className={rootClassName} data-part="root" data-loading="true" style={style}>
        <div data-part="skeleton">
          <div data-part="skeleton-header" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-${i}`} data-part="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName} data-part="root" data-loading="false" style={style}>
      {onFilter && (
        <div
          data-part="filter-bar"
          role="region"
          aria-label={t('operationalLedger.filterRegion', 'Ledger filters')}
        >
          <ModernSelect
            multiple
            size="sm"
            allowClear
            placeholder={t('operationalLedger.filterType', 'Filter by type')}
            value={filters?.types ?? []}
            onChange={(val) => {
              const types = (Array.isArray(val) ? val : []) as LedgerFilter['types'];
              onFilter({ ...filters, types });
            }}
            options={[
              { label: t('operationalLedger.type.credit', 'Credit'), value: 'credit' },
              { label: t('operationalLedger.type.debit', 'Debit'), value: 'debit' },
            ]}
          />
          <span data-part="filter-count" aria-live="polite">
            {t('operationalLedger.entryCount', `${entries.length} entries`, { count: entries.length })}
          </span>
        </div>
      )}

      {entries.length === 0 ? (
        <div data-part="empty">
          <ModernEmptyState
            title={emptyMessage ?? t('operationalLedger.empty', 'No ledger entries found')}
          />
        </div>
      ) : (
        <div data-part="table-region">
          <table data-part="table">
            <thead data-part="table-head">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    data-part="header-cell"
                    data-column={col.key}
                    data-priority={col.priority}
                  >
                    {t(`operationalLedger.column.${col.key}`, COLUMN_FLOOR[col.key])}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody data-part="table-body">
              {entries.map((entry) => (
                <tr key={entry.id} data-part="entry" data-type={entry.type}>
                  <td data-part="cell" data-column="timestamp">
                    <span data-part="cell-timestamp">{formatTimestamp(entry.timestamp)}</span>
                  </td>
                  <td data-part="cell" data-column="description">
                    <span data-part="cell-description">{entry.description}</span>
                  </td>
                  <td data-part="cell" data-column="quantity">
                    <span data-part="cell-quantity" data-type={entry.type}>
                      <VisuallyHidden>
                        {t(`operationalLedger.type.${entry.type}`, entry.type)}
                      </VisuallyHidden>
                      {formatQuantity(entry)}
                    </span>
                  </td>
                  <td data-part="cell" data-column="actor" data-priority="low">
                    <span data-part="cell-actor">{entry.actor}</span>
                  </td>
                  <td data-part="cell" data-column="reason" data-priority="low">
                    <span data-part="cell-reason">{entry.reason ?? '—'}</span>
                  </td>
                  <td data-part="cell" data-column="reference" data-priority="low">
                    <span data-part="cell-reference">{entry.reference ?? '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
