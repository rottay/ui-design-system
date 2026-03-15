/**
 * EvDjDashboard - Core Interface
 * DJ/Artist dashboard
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvDjDashboardPreset = 'standard' | 'compact';

export interface GigInfo {
  id: string;
  eventName: string;
  venue: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: "upcoming" | "live" | "completed";
  fee: number;
}

export interface SessionStat {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export interface TipSummary {
  totalAmount: number;
  currency: string;
  topTipper?: string;
  sessionCount: number;
}

export interface RequestHistory {
  id: string;
  songTitle: string;
  artist: string;
  status: "pending" | "accepted" | "played" | "rejected";
  requestedAt: Date;
}

export interface EvDjDashboardProps extends EngineAwareProps {
  preset?: EvDjDashboardPreset;
  artistName?: string;
  upcomingGigs?: GigInfo[];
  sessionStats?: SessionStat[];
  tipSummary?: TipSummary;
  recentRequests?: RequestHistory[];
  onGigClick?: (gigId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_DJ_DASHBOARD_DEFAULTS: Partial<EvDjDashboardProps> = {
  preset: 'standard',
  artistName: 'Artist',
};
