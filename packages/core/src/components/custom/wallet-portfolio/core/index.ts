/**
 * WalletPortfolio - Core Interface
 * Multi-wallet portfolio viewer with chain badges, asset breakdowns,
 * and 24h change indicators.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type WalletPortfolioPreset = 'overview' | 'detailed';

export type WalletType = 'custodial' | 'non-custodial' | 'smart-contract' | 'hardware';

export type ChainType = 'ethereum' | 'polygon' | 'solana' | 'bitcoin' | 'arbitrum' | 'optimism';

export interface WalletAsset {
  symbol: string;
  name: string;
  balance: number;
  valueUsd: number;
  change24h: number;
  chain: ChainType;
  contractAddress?: string;
  icon?: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  address: string;
  chain: ChainType;
  totalValueUsd: number;
  assets: WalletAsset[];
  createdAt: Date;
  lastActivityAt?: Date;
  isDefault?: boolean;
}

export interface WalletPortfolioProps extends EngineAwareProps {
  preset?: WalletPortfolioPreset;
  wallets: Wallet[];
  onSelectWallet?: (id: string) => void;
  onCreateWallet?: () => void;
  selectedWalletId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const WALLET_PORTFOLIO_DEFAULTS: Partial<WalletPortfolioProps> = {
  preset: 'overview',
  title: 'Wallet Portfolio',
};

// ============================================================================
// Shared Utilities
// ============================================================================

export interface ChainColorConfig {
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export function getChainColors(tokens: DesignTokens): Record<ChainType, ChainColorConfig> {
  return {
    ethereum: {
      bgColor: tokens.colors.infoScale[100],
      textColor: tokens.colors.infoScale[700],
      borderColor: tokens.colors.infoScale[200],
    },
    polygon: {
      bgColor: tokens.colors.secondaryScale[100],
      textColor: tokens.colors.secondaryScale[700],
      borderColor: tokens.colors.secondaryScale[200],
    },
    solana: {
      bgColor: tokens.colors.successScale[100],
      textColor: tokens.colors.successScale[700],
      borderColor: tokens.colors.successScale[200],
    },
    bitcoin: {
      bgColor: tokens.colors.warningScale[100],
      textColor: tokens.colors.warningScale[700],
      borderColor: tokens.colors.warningScale[200],
    },
    arbitrum: {
      bgColor: tokens.colors.primaryScale[100],
      textColor: tokens.colors.primaryScale[700],
      borderColor: tokens.colors.primaryScale[200],
    },
    optimism: {
      bgColor: tokens.colors.errorScale[100],
      textColor: tokens.colors.errorScale[700],
      borderColor: tokens.colors.errorScale[200],
    },
  };
}

export function getWalletTypeIcon(type: WalletType): string {
  const iconMap: Record<WalletType, string> = {
    'custodial': '\ud83c\udfe6',
    'non-custodial': '\ud83d\udd11',
    'smart-contract': '\ud83d\udcdc',
    'hardware': '\ud83d\udd12',
  };
  return iconMap[type] ?? '\ud83d\udcb0';
}

export function formatUsd(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}$${formatted}`;
}
