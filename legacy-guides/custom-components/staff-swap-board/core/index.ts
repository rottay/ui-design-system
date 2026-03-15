/**
 * StaffSwapBoard - Core Interface
 * Shift swap request management with approve/reject
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type StaffSwapBoardPreset = 'board' | 'table';

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string;
  targetId?: string;
  targetName?: string;
  targetAvatar?: string;
  shiftDate: string;
  shiftTime: string;
  shiftRole: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: Date;
  respondedAt?: Date;
  respondedBy?: string;
}

export interface StaffSwapBoardProps extends EngineAwareProps {
  preset?: StaffSwapBoardPreset;
  requests?: ShiftSwapRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestClick?: (id: string) => void;
  onCreateRequest?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const STAFF_SWAP_BOARD_DEFAULTS: Partial<StaffSwapBoardProps> = {
  preset: 'board',
};
