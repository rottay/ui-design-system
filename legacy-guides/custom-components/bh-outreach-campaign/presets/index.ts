/**
 * BhOutreachCampaign - All Presets
 */

export { ManagerBhOutreachCampaign } from './manager';
export { CompactBhOutreachCampaign } from './compact';

import type { BhOutreachCampaignPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhOutreachCampaignProps } from '../core';
import { ManagerBhOutreachCampaign } from './manager';
import { CompactBhOutreachCampaign } from './compact';

export const BH_OUTREACH_CAMPAIGN_PRESETS: Record<BhOutreachCampaignPreset, ComponentType<BhOutreachCampaignProps>> = {
  manager: ManagerBhOutreachCampaign,
  compact: CompactBhOutreachCampaign,
};
