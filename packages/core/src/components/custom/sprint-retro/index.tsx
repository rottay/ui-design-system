/**
 * SprintRetro - Main Export
 * Mural-style sprint retrospective board
 */

import type { SprintRetroProps } from './core';
import { SPRINT_RETRO_DEFAULTS } from './core';
import { SPRINT_RETRO_PRESETS } from './presets';

export {
  type SprintRetroProps,
  type SprintRetroPreset,
  type RetroNote,
  type RetroColumn,
  type RetroParticipant,
  type NoteColor,
  SPRINT_RETRO_DEFAULTS,
} from './core';
export * from './presets';

export function SprintRetro(props: SprintRetroProps): React.ReactElement {
  const preset = props.preset ?? SPRINT_RETRO_DEFAULTS.preset ?? 'board';
  const PresetComponent = SPRINT_RETRO_PRESETS[preset];
  return <PresetComponent {...props} />;
}

SprintRetro.displayName = 'SprintRetro';
export { BoardSprintRetro, CompactSprintRetro } from './presets';
