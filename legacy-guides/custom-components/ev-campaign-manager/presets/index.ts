export { CampaignManagerBuilder } from './builder';
export { CampaignManagerAnalytics } from './analytics';

import type { CampaignManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { CampaignManagerProps } from '../core';
import { CampaignManagerBuilder } from './builder';
import { CampaignManagerAnalytics } from './analytics';

export const PRESETS: Record<
  CampaignManagerPreset,
  ComponentType<CampaignManagerProps>
> = {
  builder: CampaignManagerBuilder,
  analytics: CampaignManagerAnalytics,
};
