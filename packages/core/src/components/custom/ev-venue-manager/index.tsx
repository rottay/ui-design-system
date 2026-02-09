/**
 * EvVenueManager - Main Export
 * Venue manager dashboard
 * Automatically selects preset based on props
 */

import type { EvVenueManagerProps } from './core';
import { EV_VENUE_MANAGER_DEFAULTS } from './core';
import { EV_VENUE_MANAGER_PRESETS } from './presets';

export {
  type EvVenueManagerProps,
  type EvVenueManagerPreset,
  type VenueInfo as EvVenueManagerVenueInfo,
  type ZoneStatus as EvVenueManagerZoneStatus,
  type StageInfo as EvVenueManagerStageInfo,
  type VenueAlert as EvVenueManagerVenueAlert,
  EV_VENUE_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvVenueManager component
 * Renders the appropriate preset based on the preset prop
 */
export function EvVenueManager(props: EvVenueManagerProps): React.ReactElement {
  const preset = props.preset ?? EV_VENUE_MANAGER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = EV_VENUE_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvVenueManager.displayName = 'EvVenueManager';

export { OverviewEvVenueManager, AnalyticsEvVenueManager } from './presets';
