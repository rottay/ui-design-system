/**
 * EvTipManager - Core Interface
 * Tip collection and analytics
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvTipManagerPreset = 'performer' | 'admin';

export interface TipRecord {
  id: string;
  from: string;
  amount: number;
  currency: string;
  type: "fiat" | "crypto";
  message?: string;
  sessionId: string;
  time: Date;
}

export interface TipStats {
  totalAmount: number;
  currency: string;
  tipCount: number;
  averageTip: number;
  topTipper: string;
  topAmount: number;
}

export interface PayoutInfo {
  id: string;
  amount: number;
  method: string;
  status: "pending" | "processing" | "completed";
  requestedAt: Date;
}

export interface EvTipManagerProps extends EngineAwareProps {
  preset?: EvTipManagerPreset;
  tips?: TipRecord[];
  stats?: TipStats;
  payouts?: PayoutInfo[];
  onRequestPayout?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_TIP_MANAGER_DEFAULTS: Partial<EvTipManagerProps> = {
  preset: 'performer',

};
