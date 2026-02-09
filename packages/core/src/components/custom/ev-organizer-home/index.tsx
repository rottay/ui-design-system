/**
 * EvOrganizerHome - Main Export
 * Event organizer main dashboard
 * Automatically selects preset based on props
 */

import type { EvOrganizerHomeProps } from './core';
import { EV_ORGANIZER_HOME_DEFAULTS } from './core';
import { EV_ORGANIZER_HOME_PRESETS } from './presets';

export {
  type EvOrganizerHomeProps,
  type EvOrganizerHomePreset,
  type EventKpi as EvOrganizerHomeEventKpi,
  type UpcomingEvent as EvOrganizerHomeUpcomingEvent,
  type RevenueSource as EvOrganizerHomeRevenueSource,
  type LineupSlot as EvOrganizerHomeLineupSlot,
  type OrganizerAction as EvOrganizerHomeOrganizerAction,
  EV_ORGANIZER_HOME_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvOrganizerHome component
 * Renders the appropriate preset based on the preset prop
 */
export function EvOrganizerHome(props: EvOrganizerHomeProps): React.ReactElement {
  const preset = props.preset ?? EV_ORGANIZER_HOME_DEFAULTS.preset ?? 'overview';
  const PresetComponent = EV_ORGANIZER_HOME_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvOrganizerHome.displayName = 'EvOrganizerHome';

export { OverviewEvOrganizerHome, CompactEvOrganizerHome } from './presets';
