/**
 * EvSongRequests - Main Export
 * Song request queue with voting
 * Automatically selects preset based on props
 */

import type { EvSongRequestsProps } from './core';
import { EV_SONG_REQUESTS_DEFAULTS } from './core';
import { EV_SONG_REQUESTS_PRESETS } from './presets';

export {
  type EvSongRequestsProps,
  type EvSongRequestsPreset,
  type SongRequestItem as EvSongRequestsSongRequestItem,
  EV_SONG_REQUESTS_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvSongRequests component
 * Renders the appropriate preset based on the preset prop
 */
export function EvSongRequests(props: EvSongRequestsProps): React.ReactElement {
  const preset = props.preset ?? EV_SONG_REQUESTS_DEFAULTS.preset ?? 'queue';
  const PresetComponent = EV_SONG_REQUESTS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvSongRequests.displayName = 'EvSongRequests';

export { QueueEvSongRequests, VotingEvSongRequests } from './presets';
