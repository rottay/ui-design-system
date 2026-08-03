'use client';

/**
 * @fileoverview OperationalLedger pattern -- engine-aware dense ledger for
 * stock movements, payroll, and similar transactional data with signed
 * quantities, reason codes, actor attribution, and inline filtering.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { OperationalLedgerProps } from './contracts';

export type {
  OperationalLedgerProps,
  LedgerEntry,
  LedgerFilter,
} from './contracts';

/**
 * @category domain-kit (ops/finance)
 * Ships a real modern engine (token-driven, native table anatomy); classic
 * and rustic continue to resolve to the shared classic implementation.
 */
export const PatternOperationalLedger = createEngineComponent<OperationalLedgerProps>(
  'PatternOperationalLedger',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/classic'),
  }
);
