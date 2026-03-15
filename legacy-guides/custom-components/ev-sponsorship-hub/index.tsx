/**
 * EvSponsorshipHub - Main Export
 * Sponsor CRM with pipeline kanban and dashboard for deliverables and ROI tracking
 */

import type { EvSponsorshipHubProps } from './core';
import { EV_SPONSORSHIP_HUB_DEFAULTS } from './core';
import { EV_SPONSORSHIP_HUB_PRESETS } from './presets';

export {
  type EvSponsorshipHubProps,
  type EvSponsorshipHubPreset,
  type Sponsor as EvSponsorshipHubSponsor,
  type SponsorDeliverable as EvSponsorshipHubSponsorDeliverable,
  EV_SPONSORSHIP_HUB_DEFAULTS,
} from './core';
export * from './presets';

export function EvSponsorshipHub(props: EvSponsorshipHubProps): React.ReactElement {
  const preset = props.preset ?? EV_SPONSORSHIP_HUB_DEFAULTS.preset ?? 'pipeline';
  const PresetComponent = EV_SPONSORSHIP_HUB_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvSponsorshipHub.displayName = 'EvSponsorshipHub';

export { PipelineEvSponsorshipHub, DashboardEvSponsorshipHub } from './presets';
