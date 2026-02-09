/**
 * EvLineupBuilder - All Presets
 */

export { TimelineEvLineupBuilder } from './timeline';
export { ListEvLineupBuilder } from './list';

import type { EvLineupBuilderPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvLineupBuilderProps } from '../core';
import { TimelineEvLineupBuilder } from './timeline';
import { ListEvLineupBuilder } from './list';

export const EV_LINEUP_BUILDER_PRESETS: Record<EvLineupBuilderPreset, ComponentType<EvLineupBuilderProps>> = {
  timeline: TimelineEvLineupBuilder,
  list: ListEvLineupBuilder,
};
