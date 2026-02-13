/**
 * BhClientCard - Core Interface
 * Client summary card with tier/contract badges for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhClientCardPreset = 'standard' | 'compact';

export interface BhClientCardProps extends EngineAwareProps {
  preset?: BhClientCardPreset;
  clientName: string;
  tier: 'enterprise' | 'business' | 'starter';
  contractStatus: 'active' | 'expiring' | 'expired';
  openPositions: number;
  totalHires: number;
  revenue: number;
  currency?: string;
  contactName?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const BH_CLIENT_CARD_DEFAULTS: Partial<BhClientCardProps> = {
  preset: 'standard',
  currency: 'USD',
};
