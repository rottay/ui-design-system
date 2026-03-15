/**
 * EvOnboardingFlow - All Presets
 */

export { OrganizerEvOnboardingFlow } from './organizer';
export { VenueEvOnboardingFlow } from './venue';

import type { EvOnboardingFlowPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvOnboardingFlowProps } from '../core';
import { OrganizerEvOnboardingFlow } from './organizer';
import { VenueEvOnboardingFlow } from './venue';

export const EV_ONBOARDING_FLOW_PRESETS: Record<EvOnboardingFlowPreset, ComponentType<EvOnboardingFlowProps>> = {
  organizer: OrganizerEvOnboardingFlow,
  venue: VenueEvOnboardingFlow,
};
