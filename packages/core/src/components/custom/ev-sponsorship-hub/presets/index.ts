/**
 * EvSponsorshipHub - All Presets
 */

export { PipelineEvSponsorshipHub } from './pipeline';
export { DashboardEvSponsorshipHub } from './dashboard';

import type { EvSponsorshipHubPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvSponsorshipHubProps } from '../core';
import { PipelineEvSponsorshipHub } from './pipeline';
import { DashboardEvSponsorshipHub } from './dashboard';

export const EV_SPONSORSHIP_HUB_PRESETS: Record<EvSponsorshipHubPreset, ComponentType<EvSponsorshipHubProps>> = {
  pipeline: PipelineEvSponsorshipHub,
  dashboard: DashboardEvSponsorshipHub,
};
