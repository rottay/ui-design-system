/**
 * BhPositionList - Core Interface
 * Position DataTable with filters for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBPosition[] directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBPosition } from '@rottay/recruiter';

export type BhPositionListPreset = 'table' | 'cards';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterPosition = DBPosition;

export interface BhPositionListProps extends EngineAwareProps {
  preset?: BhPositionListPreset;

  /** Array of positions to display - accepts DBPosition[] directly from @rottay/recruiter */
  positions?: DBPosition[];

  /** Callback when a position is clicked */
  onPositionClick?: (positionId: string) => void;

  /** Currently selected position ID */
  selectedPositionId?: string | null;

  /** Current sort field */
  sortBy?: string;

  /** Callback when sort changes */
  onSortChange?: (field: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_POSITION_LIST_DEFAULTS: Partial<BhPositionListProps> = {
  preset: 'table',
  loading: false,
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use RecruiterPosition (DBPosition) instead */
export type PositionListItem = RecruiterPosition;
