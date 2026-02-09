/**
 * CryptoTransactionExplorer - Core Interface
 * Blockchain transaction explorer with sortable table, detail view,
 * and real-time feed presets. Supports multi-chain transactions.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type CryptoTransactionExplorerPreset = 'table' | 'detail' | 'feed';

export type TxStatus = 'confirmed' | 'pending' | 'failed';

export type TxType =
  | 'transfer'
  | 'swap'
  | 'stake'
  | 'unstake'
  | 'mint'
  | 'burn'
  | 'contract-call'
  | 'approval';

export interface CryptoTransaction {
  id: string;
  hash: string;
  type: TxType;
  status: TxStatus;
  from: string;
  to: string;
  amount: number;
  symbol: string;
  valueUsd: number;
  gasFee: number;
  gasSymbol: string;
  chain: string;
  blockNumber?: number;
  timestamp: Date;
  contractAddress?: string;
  methodName?: string;
}

export interface CryptoTransactionExplorerProps extends EngineAwareProps {
  preset?: CryptoTransactionExplorerPreset;
  transactions: CryptoTransaction[];
  onViewTransaction?: (id: string) => void;
  onViewAddress?: (address: string) => void;
  selectedTransactionId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const CRYPTO_TRANSACTION_EXPLORER_DEFAULTS: Partial<CryptoTransactionExplorerProps> = {
  preset: 'table',
  title: 'Transactions',
};

// ============================================================================
// Shared Utilities
// ============================================================================

export interface TxStatusColors {
  bg: string;
  text: string;
  dot: string;
  label: string;
}

export function getTxStatusColors(tokens: DesignTokens): Record<TxStatus, TxStatusColors> {
  return {
    confirmed: {
      bg: tokens.colors.successScale[50],
      text: tokens.colors.successScale[700],
      dot: tokens.colors.successScale[500],
      label: 'Confirmed',
    },
    pending: {
      bg: tokens.colors.warningScale[50],
      text: tokens.colors.warningScale[700],
      dot: tokens.colors.warningScale[500],
      label: 'Pending',
    },
    failed: {
      bg: tokens.colors.errorScale[50],
      text: tokens.colors.errorScale[700],
      dot: tokens.colors.errorScale[500],
      label: 'Failed',
    },
  };
}

export function getTxTypeIcon(type: TxType): string {
  const icons: Record<TxType, string> = {
    transfer: '\u2194\uFE0F',
    swap: '\uD83D\uDD04',
    stake: '\uD83D\uDD12',
    unstake: '\uD83D\uDD13',
    mint: '\u2728',
    burn: '\uD83D\uDD25',
    'contract-call': '\uD83D\uDCDC',
    approval: '\u2705',
  };
  return icons[type];
}

export function truncateAddress(addr: string): string {
  if (addr.length <= 13) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatUsd(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}$${formatted}`;
}

export function formatCryptoAmount(amount: number, symbol: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
  return `${formatted} ${symbol}`;
}

export function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function getTxTypeLabel(type: TxType): string {
  const labels: Record<TxType, string> = {
    transfer: 'Transfer',
    swap: 'Swap',
    stake: 'Stake',
    unstake: 'Unstake',
    mint: 'Mint',
    burn: 'Burn',
    'contract-call': 'Contract Call',
    approval: 'Approval',
  };
  return labels[type];
}
