'use client';

/**
 * @fileoverview ApprovalInbox pattern -- engine-aware grouped approval items
 * organized by domain with SLA timers, amount/risk indicators, and batch
 * action capabilities.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { ApprovalInboxProps } from './ApprovalInbox.types';

export type {
  ApprovalInboxProps,
  ApprovalItem,
  ApprovalGroup,
} from './ApprovalInbox.types';

/** Engine-resolved ApprovalInbox pattern component. */
export const PatternApprovalInbox = createEngineComponent<ApprovalInboxProps>(
  'PatternApprovalInbox',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/classic'),
    rustic: () => import('./engines/classic'),
  }
);
