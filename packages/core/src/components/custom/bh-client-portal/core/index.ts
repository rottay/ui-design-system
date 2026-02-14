/**
 * BhClientPortal - Core Interface
 * Simplified read-only dashboard for external clients.
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts a DBClient directly for client info.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBClient, DBClientBilling } from '@rottay/recruiter';

export type BhClientPortalPreset = 'executive' | 'operational';

/**
 * Re-export the DB types for convenience.
 */
export type RecruiterClient = DBClient;
export type RecruiterClientBilling = DBClientBilling;

/**
 * Position data for the portal view (simplified from DBPosition).
 */
export interface ClientPosition {
  id: string;
  title: string;
  department?: string;
  status: string;
  totalCandidates: number;
  activeCandidates: number;
  interviewsScheduled: number;
  daysOpen: number;
  targetHireDate?: string;
}

/**
 * Pipeline stage aggregation (computed).
 */
export interface ClientPipelineStage {
  name: string;
  count: number;
}

/**
 * Interview data for the portal view.
 */
export interface ClientInterview {
  id: string;
  candidateName: string;
  positionTitle: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

/**
 * Key metrics for the portal (computed/aggregated).
 */
export interface ClientMetrics {
  totalOpenPositions: number;
  totalActiveCandidates: number;
  avgTimeToFill: number;
  fillRate: number;
  upcomingInterviews: number;
  offersExtended: number;
}

export interface BhClientPortalProps extends EngineAwareProps {
  preset?: BhClientPortalPreset;

  /** Client data - accepts DBClient directly from @rottay/recruiter */
  client?: DBClient;

  /** Client's positions */
  positions?: ClientPosition[];

  /** Pipeline stages aggregation */
  pipeline?: ClientPipelineStage[];

  /** Upcoming interviews */
  interviews?: ClientInterview[];

  /** Key metrics */
  metrics?: ClientMetrics;

  /** Client billing/invoicing records - accepts DBClientBilling[] from @rottay/recruiter */
  billingRecords?: DBClientBilling[];

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

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use RecruiterClient (DBClient) instead */
export type ClientInfo = RecruiterClient;
