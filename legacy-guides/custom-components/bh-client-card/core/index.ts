/**
 * BhClientCard - Core Interface
 * Client summary card with tier/contract badges for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts a DBClient directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBClient } from '@rottay/recruiter';

export type BhClientCardPreset = 'standard' | 'compact';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterClient = DBClient;

export interface BhClientCardProps extends EngineAwareProps {
  preset?: BhClientCardPreset;

  /** Client data - accepts DBClient directly from @rottay/recruiter */
  client?: DBClient;

  /** Click handler */
  onClick?: () => void;

  /** Whether to display the client tier badge */
  showTier?: boolean;

  /** Whether to display key metrics (placements, revenue) */
  showMetrics?: boolean;

  /** Use compact layout with reduced spacing */
  compact?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CLIENT_CARD_DEFAULTS: Partial<BhClientCardProps> = {
  preset: 'standard',
};
