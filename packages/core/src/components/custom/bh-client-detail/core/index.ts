/**
 * BhClientDetail - Core Interface
 * Client dashboard with positions and revenue for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts a DBClient directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBClient, DBClientBilling } from '@rottay/recruiter';

export type BhClientDetailPreset = 'dashboard' | 'compact';

/**
 * Re-export the DB types for convenience.
 */
export type RecruiterClient = DBClient;
export type RecruiterClientBilling = DBClientBilling;

/**
 * Position summary for display within the client detail view.
 */
export interface ClientPosition {
  id: string;
  title: string;
  status: string;
  candidates: number;
  daysOpen: number;

  /** Recruiter assigned to this position */
  assignedRecruiterId?: string;

  /** SLA target in days for filling the position */
  slaTargetDays?: number;

  /** Target number of candidates to source */
  targetCandidates?: number;

  /** Position priority level */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * Revenue data point for chart display (computed/aggregated).
 */
export interface RevenuePoint {
  month: string;
  amount: number;

  /** Currency code (e.g. 'USD', 'EUR') */
  currency?: string;

  /** Revenue breakdown by source */
  breakdown?: { placements: number; retainer?: number };
}

/**
 * Contract details associated with a client engagement.
 */
export interface ClientContract {
  /** Type of contract (e.g. contingency, retained, exclusive, hybrid) */
  contractType?: string;

  /** Contract start date (ISO 8601) */
  contractStartDate?: string;

  /** Contract end date (ISO 8601) */
  contractEndDate?: string;

  /** External contract reference number */
  contractReference?: string;

  /** Fee percentage charged on placements */
  feePercentage?: number;

  /** Fixed retainer amount */
  retainerAmount?: number;

  /** Guarantee period in days for placed candidates */
  guaranteePeriodDays?: number;
}

export interface BhClientDetailProps extends EngineAwareProps {
  preset?: BhClientDetailPreset;

  /** Client data - accepts DBClient directly from @rottay/recruiter */
  client?: DBClient;

  /** Positions associated with this client */
  positions?: ClientPosition[];

  /** Revenue history for chart display */
  revenueHistory?: RevenuePoint[];

  /** Client billing records - accepts DBClientBilling[] from @rottay/recruiter */
  billingRecords?: DBClientBilling[];

  /** Callback when a position is clicked */
  onPositionClick?: (positionId: string) => void;

  /** Contract details for this client */
  contract?: ClientContract;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CLIENT_DETAIL_DEFAULTS: Partial<BhClientDetailProps> = {
  preset: 'dashboard',
  loading: false,
};
