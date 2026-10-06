'use client';

/**
 * @fileoverview ApprovalInbox pattern -- engine-aware grouped approval items
 * organized by domain with SLA timers, amount/risk indicators, and batch
 * action capabilities.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { ApprovalInboxProps } from './contracts';

export type {
  ApprovalInboxProps,
  ApprovalItem,
  ApprovalGroup,
} from './contracts';

/**
 * Compact, embeddable approve/reject inbox: items grouped by domain, each with
 * optional amount, risk and SLA deadline, single approve/reject actions and
 * batch approve over a selection. Implemented on Classic and Modern; Rustic is
 * a declared absence.
 */
export const PatternApprovalInbox = createEngineComponent<ApprovalInboxProps>(
  'PatternApprovalInbox',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    // No rustic implementation exists, and the engine freeze forbids writing
    // one. A declared absence throws instead of painting classic chrome.
    rustic: null,
  }
);
