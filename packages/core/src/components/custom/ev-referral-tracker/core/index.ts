import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type ReferralTrackerPreset = 'ambassador' | 'admin';

export interface Ambassador {
  id: string;
  name: string;
  referralCode: string;
  clicks: number;
  signups: number;
  sales: number;
  earnings: number;
  tier: 'starter' | 'pro' | 'elite';
  status: 'active' | 'paused' | 'suspended';
}

export interface ReferralChain {
  referrerId: string;
  referredId: string;
  referredName: string;
  date: Date;
  converted: boolean;
  revenue: number;
}

export interface ReferralTrackerProps extends EngineAwareProps {
  preset?: ReferralTrackerPreset;
  ambassadors?: Ambassador[];
  chains?: ReferralChain[];
  onAmbassadorClick?: (ambassadorId: string) => void;
  onConfigRewards?: () => void;
  onToggleStatus?: (ambassadorId: string, status: Ambassador['status']) => void;
  style?: CSSProperties;
  className?: string;
}

export const REFERRAL_TRACKER_DEFAULTS: Required<
  Pick<ReferralTrackerProps, 'preset' | 'ambassadors' | 'chains'>
> = {
  preset: 'ambassador',
  ambassadors: [],
  chains: [],
};
