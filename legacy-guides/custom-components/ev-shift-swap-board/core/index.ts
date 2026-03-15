/**
 * EvShiftSwapBoard - Core Interface
 * Shift swap request board
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvShiftSwapBoardPreset = 'board' | 'list';

export interface SwapRequest {
  id: string;
  requesterName: string;
  targetName?: string;
  shiftDate: Date;
  shiftRole: string;
  shiftTime: string;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "matched";
  createdAt: Date;
}

export interface EvShiftSwapBoardProps extends EngineAwareProps {
  preset?: EvShiftSwapBoardPreset;
  requests?: SwapRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onVolunteer?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_SHIFT_SWAP_BOARD_DEFAULTS: Partial<EvShiftSwapBoardProps> = {
  preset: 'board',

};
