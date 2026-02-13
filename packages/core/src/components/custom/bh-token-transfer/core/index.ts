/**
 * BhTokenTransfer - Core Interface
 * Timeline of token transfers between teams
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhTokenTransferPreset = 'timeline' | 'compact';

export interface TokenTransferTeam {
  id: string;
  name: string;
}

export interface TokenTransfer {
  id: string;
  fromTeam: TokenTransferTeam;
  toTeam: TokenTransferTeam;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface BhTokenTransferProps extends EngineAwareProps {
  preset?: BhTokenTransferPreset;
  transfers: TokenTransfer[];
  onApprove?: (transferId: string) => void;
  onReject?: (transferId: string) => void;
  onRequestTransfer?: () => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_TOKEN_TRANSFER_DEFAULTS: Partial<BhTokenTransferProps> = {
  preset: 'timeline',
};
