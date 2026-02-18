/**
 * BhAppealList - Core Interface
 * Appeal list with status tracking for BitHire ATS platform
 *
 * Uses AppealSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { AppealSelect, AppealStatusValue } from '@rottay/scoring';

export type BhAppealListPreset = 'table' | 'compact';

/** DB appeal status values: 'pending' | 'under_review' | 'approved' | 'rejected' */
export type AppealStatus = AppealStatusValue;

/** UI appeal status for display purposes */
export type AppealListItemStatus = 'pending' | 'under-review' | 'approved' | 'denied';

/** Extended appeal view combining DB entity with UI display fields */
export interface AppealListItem {
  /** The DB entity (all fields optional for safety) */
  appeal?: Partial<AppealSelect>;
  /** Unique appeal identifier (convenience field) */
  id?: string;
  /** Display name of the candidate (resolved externally) */
  candidateName?: string;
  /** Position title (resolved externally) */
  positionTitle?: string;
  /** UI status for display (mapped from DB status) */
  status?: AppealListItemStatus;
  /** When the appeal was submitted */
  submittedAt?: Date;
  /** UI priority (computed) */
  priority?: 'high' | 'medium' | 'low';
  /** Original score before appeal */
  originalScore?: number;
  /** Adjusted score after appeal resolution */
  adjustedScore?: number;
  /** Dimension score ID the appeal targets */
  dimensionScoreId?: string;
  /** When the appeal was reviewed */
  reviewedAt?: Date;
  /** ID or name of the reviewer */
  reviewedBy?: string;
}

export interface BhAppealListProps extends EngineAwareProps {
  preset?: BhAppealListPreset;

  /** List of appeals */
  appeals?: AppealListItem[];

  /** Callback when an appeal is clicked */
  onAppealClick?: (appealId: string) => void;

  /** Currently selected appeal ID */
  selectedAppealId?: string | null;

  /** Active status filter */
  filterStatus?: string | null;

  /** Callback when status filter changes */
  onFilterChange?: (status: string | null) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_APPEAL_LIST_DEFAULTS: Partial<BhAppealListProps> = {
  preset: 'table',
};

/** Re-export DB types for convenience */
export type { AppealSelect, AppealStatusValue };
