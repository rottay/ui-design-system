/**
 * BhOutreachCampaign - Core Interface
 * Campaign manager with response analytics for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component uses DBOutreachActivity as the base entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBOutreachActivity } from '@rottay/recruiter';

export type BhOutreachCampaignPreset = 'manager' | 'compact';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterOutreachActivity = DBOutreachActivity;

/**
 * Campaign-level aggregation data (computed from outreach activities).
 * Not a direct DB entity - campaigns are aggregated from activities.
 */
export interface CampaignData {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  sent: number;
  opened: number;
  replied: number;
  startDate: Date;
  endDate?: Date;
  targetAudience?: string;
  channel?: 'email' | 'linkedin' | 'sms';
  templateId?: string;
  conversionRate?: number;
  bounceRate?: number;
  unsubscribeRate?: number;
  budget?: number;
  costPerReply?: number;
}

export interface BhOutreachCampaignProps extends EngineAwareProps {
  preset?: BhOutreachCampaignPreset;

  /** List of campaigns (aggregated from outreach activities) */
  campaigns?: CampaignData[];

  /** Raw outreach activities for reference */
  activities?: DBOutreachActivity[];

  /** Callback when a campaign is clicked */
  onCampaignClick?: (id: string) => void;

  /** Callback to create a new campaign */
  onCreateCampaign?: () => void;

  /** Currently selected campaign */
  selectedCampaignId?: string | null;

  /** Total messages sent across all campaigns */
  totalSent?: number;

  /** Total replies across all campaigns */
  totalReplied?: number;

  /** Average response rate across all campaigns */
  avgResponseRate?: number;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_OUTREACH_CAMPAIGN_DEFAULTS: Partial<BhOutreachCampaignProps> = {
  preset: 'manager',
};
