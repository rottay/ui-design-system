/**
 * EvVenueDirectory - Main Export
 * Venue directory with card/map view
 * Automatically selects preset based on props
 */

import type { EvVenueDirectoryProps } from './core';
import { EV_VENUE_DIRECTORY_DEFAULTS } from './core';
import { EV_VENUE_DIRECTORY_PRESETS } from './presets';

export {
  type EvVenueDirectoryProps,
  type EvVenueDirectoryPreset,
  type VenueCard as EvVenueDirectoryVenueCard,
  type VenueFilter as EvVenueDirectoryVenueFilter,
  EV_VENUE_DIRECTORY_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvVenueDirectory component
 * Renders the appropriate preset based on the preset prop
 */
export function EvVenueDirectory(props: EvVenueDirectoryProps): React.ReactElement {
  const preset = props.preset ?? EV_VENUE_DIRECTORY_DEFAULTS.preset ?? 'cards';
  const PresetComponent = EV_VENUE_DIRECTORY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvVenueDirectory.displayName = 'EvVenueDirectory';

export { CardsEvVenueDirectory, MapEvVenueDirectory } from './presets';
