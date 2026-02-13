/**
 * BhOutreachCampaign - Main Export
 * Campaign manager with response analytics for BitHire ATS platform
 */

import type { BhOutreachCampaignProps } from './core';
import { BH_OUTREACH_CAMPAIGN_DEFAULTS } from './core';
import { BH_OUTREACH_CAMPAIGN_PRESETS } from './presets';

export {
  type BhOutreachCampaignProps,
  type BhOutreachCampaignPreset,
  type CampaignData,
  BH_OUTREACH_CAMPAIGN_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhOutreachCampaign component
 * Renders the appropriate preset based on the preset prop
 */
export function BhOutreachCampaign(props: BhOutreachCampaignProps): React.ReactElement {
  const preset = props.preset ?? BH_OUTREACH_CAMPAIGN_DEFAULTS.preset ?? 'manager';
  const PresetComponent = BH_OUTREACH_CAMPAIGN_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhOutreachCampaign.displayName = 'BhOutreachCampaign';

export { ManagerBhOutreachCampaign, CompactBhOutreachCampaign } from './presets';
