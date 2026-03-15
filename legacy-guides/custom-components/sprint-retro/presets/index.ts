/**
 * SprintRetro Presets
 */

export { BoardSprintRetro } from './board';
export { CompactSprintRetro } from './compact';

import type { SprintRetroPreset } from '../core';
import type { ComponentType } from 'react';
import type { SprintRetroProps } from '../core';
import { BoardSprintRetro } from './board';
import { CompactSprintRetro } from './compact';

export const SPRINT_RETRO_PRESETS: Record<SprintRetroPreset, ComponentType<SprintRetroProps>> = {
  board: BoardSprintRetro,
  compact: CompactSprintRetro,
};
