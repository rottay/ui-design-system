/**
 * BhPositionList - Core Interface
 * Position DataTable with filters for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPositionListPreset = 'table' | 'cards';

export interface PositionListItem {
  id: string;
  title: string;
  clientName: string;
  department: string;
  status: 'open' | 'filled' | 'closed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  candidates: number;
  daysOpen: number;
  assignee: string;
}

export interface BhPositionListProps extends EngineAwareProps {
  preset?: BhPositionListPreset;

  /** Array of positions to display */
  positions: PositionListItem[];

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
