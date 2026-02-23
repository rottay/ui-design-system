/**
 * BhWarRoom - Main Export
 * Live War Room for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhWarRoomProps } from './core';
import { BH_WAR_ROOM_DEFAULTS } from './core';
import { BH_WAR_ROOM_PRESETS } from './presets';

export {
  type BhWarRoomProps,
  type BhWarRoomPreset,
  type WarRoomSession,
  type WarRoomParticipant,
  type WarRoomCandidate,
  type WarRoomDimensionScore,
  type WarRoomVote,
  type WarRoomDecision,
  type WarRoomAction,
  BH_WAR_ROOM_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhWarRoom component
 * Renders the appropriate preset based on the preset prop
 */
export function BhWarRoom(props: BhWarRoomProps): React.ReactElement {
  const preset = props.preset ?? BH_WAR_ROOM_DEFAULTS.preset ?? 'list';
  const PresetComponent = BH_WAR_ROOM_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhWarRoom.displayName = 'BhWarRoom';

export { ListBhWarRoom, CollaborativeBhWarRoom } from './presets';
