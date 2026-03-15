/**
 * BhTokenTransfer - Core Interface
 * Timeline of token transfers between teams
 *
 * Token types imported from @rottay/recruiter (single source of truth).
 * DBTokenTransaction.transactionType includes 'transfer_in' | 'transfer_out'
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBTokenTransaction } from '@rottay/recruiter';

export type BhTokenTransferPreset = 'timeline' | 'compact';

export interface TokenTransferTeam {
  id: string;
  name: string;
  balance?: number;
  department?: string;
}

/**
 * Token transfer display - corresponds to paired DBTokenTransaction records
 * with transactionType 'transfer_in' / 'transfer_out'.
 */
export interface TokenTransfer {
  /** DBTokenTransaction.id */
  id: string;
  fromTeam: TokenTransferTeam;
  toTeam: TokenTransferTeam;
  /** DBTokenTransaction.amount */
  amount: number;
  /** DBTokenTransaction.description */
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  /** DBTokenTransaction.performedBy */
  requestedBy: string;
  /** DBTokenTransaction.performedAt */
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  category?: 'interview' | 'assessment' | 'other';
  relatedEntityId?: string;
  relatedEntityType?: string;
  expiresAt?: Date;
  priority?: 'low' | 'normal' | 'high';
}

export interface BhTokenTransferProps extends EngineAwareProps {
  preset?: BhTokenTransferPreset;
  transfers?: TokenTransfer[];
  onApprove?: (transferId: string) => void;
  onReject?: (transferId: string) => void;
  onRequestTransfer?: () => void;
  totalBalance?: number;
  monthlyBudget?: number;
  burnRate?: number;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_TOKEN_TRANSFER_DEFAULTS: Partial<BhTokenTransferProps> = {
  preset: 'timeline',
};

/** Backward-compat alias (old name from pre-migration) */
export type TokenTransaction = DBTokenTransaction;

/** Re-export DB type for convenience */
export type { DBTokenTransaction };
