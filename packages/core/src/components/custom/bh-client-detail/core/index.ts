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
}

/**
 * Revenue data point for chart display (computed/aggregated).
 */
export interface RevenuePoint {
  month: string;
  amount: number;
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
