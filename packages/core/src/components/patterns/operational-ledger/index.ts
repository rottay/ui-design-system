'use client';

/**
 * @fileoverview OperationalLedger pattern -- engine-aware dense ledger for
 * stock movements, payroll, and similar transactional data with signed
 * quantities, reason codes, actor attribution, and inline filtering.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { OperationalLedgerProps } from './OperationalLedger.types';

export type {
  OperationalLedgerProps,
  LedgerEntry,
  LedgerFilter,
} from './OperationalLedger.types';

/** Engine-resolved OperationalLedger pattern component. */
export const PatternOperationalLedger = createEngineComponent<OperationalLedgerProps>(
  'PatternOperationalLedger',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/classic'),
    rustic: () => import('./engines/classic'),
  }
);
