import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type PaymentGatewayConfigPreset = 'overview' | 'setup';

export type GatewayProvider = 'stripe' | 'paypal' | 'square' | 'adyen' | 'braintree' | 'crypto';

export type GatewayStatus = 'active' | 'inactive' | 'test-mode' | 'error';

export interface PaymentGateway {
  id: string;
  provider: GatewayProvider;
  name: string;
  status: GatewayStatus;
  isTestMode: boolean;
  supportedCurrencies: string[];
  supportedMethods: string[];
  webhookUrl?: string;
  lastTransactionAt?: Date;
  transactionCount: number;
  successRate: number;
  monthlyVolume: number;
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentGatewayConfigProps extends EngineAwareProps {
  preset?: PaymentGatewayConfigPreset;
  gateways: PaymentGateway[];
  onAddGateway?: () => void;
  onEditGateway?: (id: string) => void;
  onDeleteGateway?: (id: string) => void;
  onToggleTestMode?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  selectedGatewayId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const PAYMENT_GATEWAY_CONFIG_DEFAULTS: Partial<PaymentGatewayConfigProps> = {
  preset: 'overview',
  title: 'Payment Gateways',
};

export function getStatusColors(tokens: DesignTokens) {
  return {
    active: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], dot: tokens.colors.successScale[500], border: tokens.colors.successScale[200] },
    inactive: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100], dot: tokens.colors.neutral[400], border: tokens.colors.neutral[200] },
    'test-mode': { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], dot: tokens.colors.warningScale[500], border: tokens.colors.warningScale[200] },
    error: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], dot: tokens.colors.errorScale[500], border: tokens.colors.errorScale[200] },
  };
}

export function getProviderIcon(provider: GatewayProvider): string {
  return {
    stripe: '\u{1F4B3}',
    paypal: '\u{1F17F}',
    square: '\u2B1C',
    adyen: '\u{1F537}',
    braintree: '\u{1F333}',
    crypto: '\u20BF',
  }[provider];
}

export function formatVolume(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}
