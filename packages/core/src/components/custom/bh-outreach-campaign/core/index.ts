/**
 * BhOutreachCampaign - Core Interface
 * Campaign manager with response analytics for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhOutreachCampaignPreset = 'manager' | 'compact';

export interface CampaignData {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  sent: number;
  opened: number;
  replied: number;
  startDate: Date;
}

export interface BhOutreachCampaignProps extends EngineAwareProps {
  preset?: BhOutreachCampaignPreset;

  /** List of campaigns */
  campaigns: CampaignData[];

  /** Callback when a campaign is clicked */
  onCampaignClick?: (id: string) => void;

  /** Callback to create a new campaign */
  onCreateCampaign?: () => void;

  /** Currently selected campaign */
  selectedCampaignId?: string | null;

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
