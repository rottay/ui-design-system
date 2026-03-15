/**
 * EvOrganizerHome - All Presets
 */

export { OverviewEvOrganizerHome } from './overview';
export { CompactEvOrganizerHome } from './compact';

import type { EvOrganizerHomePreset } from '../core';
import type { ComponentType } from 'react';
import type { EvOrganizerHomeProps } from '../core';
import { OverviewEvOrganizerHome } from './overview';
import { CompactEvOrganizerHome } from './compact';

export const EV_ORGANIZER_HOME_PRESETS: Record<EvOrganizerHomePreset, ComponentType<EvOrganizerHomeProps>> = {
  overview: OverviewEvOrganizerHome,
  compact: CompactEvOrganizerHome,
};
