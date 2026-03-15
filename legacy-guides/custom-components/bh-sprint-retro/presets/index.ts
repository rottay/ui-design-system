/**
 * BhSprintRetro - All Presets
 */

export { SessionBhSprintRetro } from './session';

import type { BhSprintRetroPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhSprintRetroProps } from '../core';
import { SessionBhSprintRetro } from './session';

export const BH_SPRINT_RETRO_PRESETS: Record<BhSprintRetroPreset, ComponentType<BhSprintRetroProps>> = {
  session: SessionBhSprintRetro,
};
