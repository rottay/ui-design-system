/**
 * BhAppealList - Core Interface
 * Appeal list with status tracking for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhAppealListPreset = 'table' | 'compact';

export interface AppealListItem {
  id: string;
  candidateName: string;
  positionTitle: string;
  status: 'pending' | 'under-review' | 'approved' | 'denied';
  submittedAt: Date;
  priority: 'high' | 'medium' | 'low';
}

export interface BhAppealListProps extends EngineAwareProps {
  preset?: BhAppealListPreset;

  /** List of appeals */
  appeals: AppealListItem[];

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
