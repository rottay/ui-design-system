/**
 * BhClientPortal - Core Interface
 * Simplified read-only dashboard for external clients.
 * Tables: recruiting_clients + recruiting_positions + recruiting_applications
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhClientPortalPreset = 'executive' | 'operational';

export interface ClientPosition {
  id: string;
  title: string;
  department: string;
  status: 'open' | 'on_hold' | 'filled' | 'cancelled';
  totalCandidates: number;
  activeCandidates: number;
  interviewsScheduled: number;
  daysOpen: number;
  targetHireDate?: string;
}

export interface ClientPipelineStage {
  name: string;
  count: number;
}

export interface ClientInterview {
  id: string;
  candidateName: string;
  positionTitle: string;
  date: string;
  time: string;
  type: 'phone' | 'video' | 'onsite' | 'panel';
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ClientMetrics {
  totalOpenPositions: number;
  totalActiveCandidates: number;
  avgTimeToFill: number;
  fillRate: number;
  upcomingInterviews: number;
  offersExtended: number;
}

export interface ClientInfo {
  name: string;
  logo?: string;
  contactName: string;
  contactEmail: string;
}

export interface BhClientPortalProps extends EngineAwareProps {
  preset?: BhClientPortalPreset;

  /** Client information */
  client?: ClientInfo;

  /** Client's positions */
  positions?: ClientPosition[];

  /** Pipeline stages aggregation */
  pipeline?: ClientPipelineStage[];

  /** Upcoming interviews */
  interviews?: ClientInterview[];

  /** Key metrics */
  metrics?: ClientMetrics;

  /** Selected position for detail */
  selectedPosition?: string | null;

  /** Callback when position is selected */
  onPositionSelect?: (positionId: string | null) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CLIENT_PORTAL_DEFAULTS: Partial<BhClientPortalProps> = {
  preset: 'executive',
};
