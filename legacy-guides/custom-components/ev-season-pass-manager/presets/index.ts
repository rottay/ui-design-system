/**
 * EvSeasonPassManager - All Presets
 */

export { OverviewEvSeasonPassManager } from './overview';
export { EditorEvSeasonPassManager } from './editor';

import type { EvSeasonPassManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvSeasonPassManagerProps } from '../core';
import { OverviewEvSeasonPassManager } from './overview';
import { EditorEvSeasonPassManager } from './editor';

export const EV_SEASON_PASS_MANAGER_PRESETS: Record<EvSeasonPassManagerPreset, ComponentType<EvSeasonPassManagerProps>> = {
  overview: OverviewEvSeasonPassManager,
  editor: EditorEvSeasonPassManager,
};
