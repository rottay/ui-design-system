import type { CampaignManagerProps } from './core';
import { CAMPAIGN_MANAGER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  CampaignManagerProps,
  Campaign,
  CampaignSegment,
  CampaignManagerPreset,
} from './core';

export type EvCampaignManagerProps = CampaignManagerProps;

export function CampaignManager(props: CampaignManagerProps) {
  const { preset = CAMPAIGN_MANAGER_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

CampaignManager.displayName = 'CampaignManager';

export const EvCampaignManager = CampaignManager;
export { CampaignManagerBuilder, CampaignManagerAnalytics } from './presets';
