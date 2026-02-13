/**
 * BhOutreachResponse - Core Interface
 * Response rate charts, best time analysis for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhOutreachResponsePreset = 'analytics' | 'compact';

export interface ResponseData {
  hour: number;
  dayOfWeek: number;
  responseRate: number;
  count: number;
}

export interface BhOutreachResponseProps extends EngineAwareProps {
  preset?: BhOutreachResponsePreset;

  /** Response rate data by hour and day */
  data: ResponseData[];

  /** Overall response rate percentage */
  overallResponseRate: number;

  /** Best time to send outreach */
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
