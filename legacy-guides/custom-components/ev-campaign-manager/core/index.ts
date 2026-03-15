import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type CampaignManagerPreset = 'builder' | 'analytics';

export interface Campaign {
  id: string;
  name: string;
  channels: ('email' | 'sms' | 'push' | 'whatsapp')[];
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  audienceSize: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  scheduledAt?: Date;
}

export interface CampaignSegment {
  id: string;
  name: string;
  criteria: string;
  memberCount: number;
}

export interface CampaignManagerProps extends EngineAwareProps {
  preset?: CampaignManagerPreset;
  campaigns?: Campaign[];
  segments?: CampaignSegment[];
  onCampaignClick?: (campaignId: string) => void;
  onCreateCampaign?: () => void;
  onToggleStatus?: (campaignId: string, status: Campaign['status']) => void;
  style?: CSSProperties;
  className?: string;
}

export const CAMPAIGN_MANAGER_DEFAULTS: Required<
  Pick<CampaignManagerProps, 'preset' | 'campaigns' | 'segments'>
> = {
  preset: 'builder',
  campaigns: [],
  segments: [],
};
