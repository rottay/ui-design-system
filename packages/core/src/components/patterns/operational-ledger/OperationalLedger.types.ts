/**
 * @fileoverview Type definitions for the OperationalLedger pattern component.
 *
 * OperationalLedger renders a dense ledger for stock movements, payroll,
 * and similar transactional data with signed quantities, reason codes,
 * actor attribution, and inline filtering.
 *
 * @module Patterns/OperationalLedger/Types
 * @category Patterns
 * @package @rottay/design-system
 */

import type { PatternBaseProps } from '../types';

/**
 * A single ledger entry representing a credit or debit transaction.
 */
export interface LedgerEntry {
  /** Unique identifier for this entry. */
  id: string;
  /** ISO 8601 timestamp of when the entry was recorded. */
  timestamp: string;
  /** Human-readable description of the transaction. */
  description: string;
  /** Numeric quantity (positive value; sign is determined by `type`). */
  quantity: number;
  /** Transaction direction: credit (positive) or debit (negative). */
  type: 'credit' | 'debit';
  /** Name or identifier of the actor who created this entry. */
  actor: string;
  /** Optional reason code for the transaction. */
  reason?: string;
  /** Optional external reference number or identifier. */
  reference?: string;
}

/**
 * Filter configuration for narrowing displayed ledger entries.
 */
export interface LedgerFilter {
  /** Filter by transaction types. */
  types?: ('credit' | 'debit')[];
  /** Date range filter as ISO 8601 strings. */
  dateRange?: {
    /** Include entries on or after this date. */
    from?: string;
    /** Include entries on or before this date. */
    to?: string;
  };
}

/**
 * Props for the OperationalLedger pattern component.
 *
 * Renders a dense ledger table with signed quantity coloring,
 * timestamp column, actor attribution, and inline filters.
 *
 * @example
 * ```tsx
 * <PatternOperationalLedger
 *   entries={[
 *     { id: '1', timestamp: '2026-03-18T10:00:00Z', description: 'Stock received',
 *       quantity: 50, type: 'credit', actor: 'Warehouse Bot', reason: 'PO-1234' },
 *     { id: '2', timestamp: '2026-03-18T14:30:00Z', description: 'Sold to customer',
 *       quantity: 3, type: 'debit', actor: 'POS Terminal', reference: 'INV-5678' },
 *   ]}
 *   filters={{ types: ['credit'] }}
 *   onFilter={(f) => setFilters(f)}
 * />
 * ```
 */
export interface OperationalLedgerProps extends PatternBaseProps {
  /** Ledger entries to display. */
  entries: LedgerEntry[];
  /** Currently active filter configuration. */
  filters?: LedgerFilter;
  /** Callback fired when the user changes filters. */
  onFilter?: (filters: LedgerFilter) => void;
  /** Message displayed when no entries match the current filters. */
  emptyMessage?: string;
}
