/**
 * BhPositionSla - Core Interface
 * SLA countdown monitor for positions in BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPositionSlaPreset = 'monitor' | 'compact';

export interface PositionSla {
  id: string;
  positionTitle: string;
  clientName: string;
  slaDeadline: Date;
  daysRemaining: number;
  status: 'on-track' | 'at-risk' | 'breached';
  currentStage: string;
  candidateCount: number;
}

export interface BhPositionSlaProps extends EngineAwareProps {
  preset?: BhPositionSlaPreset;

  /** Array of positions with SLA data */
  positions: PositionSla[];

  /** Callback when a position is clicked */
  onPositionClick?: (positionId: string) => void;

  /** Currently selected position ID */
  selectedPositionId?: string | null;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_POSITION_SLA_DEFAULTS: Partial<BhPositionSlaProps> = {
  preset: 'monitor',
  loading: false,
};
