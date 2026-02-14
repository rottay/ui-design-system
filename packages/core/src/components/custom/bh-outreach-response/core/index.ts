/**
 * BhOutreachResponse - Core Interface
 * Response rate charts, best time analysis for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component uses DBOutreachActivity as the base entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBOutreachActivity } from '@rottay/recruiter';

export type BhOutreachResponsePreset = 'analytics' | 'compact';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterOutreachActivity = DBOutreachActivity;

/**
 * Response analytics data point (computed/aggregated from outreach activities).
 */
export interface ResponseData {
  hour: number;
  dayOfWeek: number;
  responseRate: number;
  count: number;
}

/**
 * Analytics summary (computed from outreach activities).
 */
export interface ResponseAnalytics {
  overallResponseRate: number;
  bestTime?: { hour: number; day: string };
  totalSent: number;
  totalResponses: number;
}

export interface BhOutreachResponseProps extends EngineAwareProps {
  preset?: BhOutreachResponsePreset;

  /** Response rate data by hour and day (computed/aggregated) */
  data?: ResponseData[];

  /** Analytics summary */
  analytics?: ResponseAnalytics;

  /** Overall response rate percentage (shortcut) */
  overallResponseRate?: number;

  /** Best time to send outreach (shortcut) */
  bestTime?: { hour: number; day: string };

  /** Component title */
  title?: string;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_OUTREACH_RESPONSE_DEFAULTS: Partial<BhOutreachResponseProps> = {
  preset: 'analytics',
};
