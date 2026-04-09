'use client';

/**
 * @fileoverview ApprovalInbox pattern -- engine-aware grouped approval items
 * organized by domain with SLA timers, amount/risk indicators, and batch
 * action capabilities.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { ApprovalInboxProps } from './ApprovalInbox.types';

export type {
  ApprovalInboxProps,
  ApprovalItem,
  ApprovalGroup,
} from './ApprovalInbox.types';

/**
 * @deprecated Use `DecisionInboxSurface` instead. This pattern is superseded
 * by the decision-inbox surface which composes DataTable + decision actions.
 * Will be removed in a future major version.
 */
export const PatternApprovalInbox = createEngineComponent<ApprovalInboxProps>(
  'PatternApprovalInbox',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/classic'),
    rustic: () => import('./engines/classic'),
  }
);
