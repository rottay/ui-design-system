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

  /** SLA target in days for filling the position */
  slaTargetDays?: number;

  /** Position priority level */
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  /** Name of the assigned recruiter (for display) */
  assignedRecruiterName?: string;

  /** Fee type for this position (e.g. percentage, flat) */
  feeType?: string;

  /** Fee amount (percentage or flat amount depending on feeType) */
  feeAmount?: number;
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

  /** Interview mode (e.g. in-person, video, phone) */
  interviewMode?: string;

  /** URL or path to candidate avatar image */
  candidateAvatar?: string;

  /** AI-generated candidate score */
  aiScore?: number;
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

  /** Total successful placements */
  totalPlacements?: number;

  /** Total revenue generated */
  totalRevenue?: number;

  /** Currency code for revenue values */
  revenueCurrency?: string;

  /** Average candidates sourced per position */
  avgCandidatesPerPosition?: number;

  /** Client satisfaction score (0-100 or 0-5) */
  clientSatisfactionScore?: number;

  /** Total lifetime value of the client */
  lifetimeValue?: number;
}

/**
 * Billing summary for the portal overview.
 */
export interface ClientBillingOverview {
  /** Number of invoices issued */
  invoiceCount?: number;

  /** Total amount billed */
  totalBilled?: number;

  /** Total amount paid */
  totalPaid?: number;

  /** Outstanding balance */
  outstandingBalance?: number;

  /** Currency code (e.g. 'USD', 'EUR') */
  currency?: string;

  /** Next invoice date (ISO 8601) */
  nextInvoiceDate?: string;
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

  /** Billing overview for the client portal */
  billingOverview?: ClientBillingOverview;

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
