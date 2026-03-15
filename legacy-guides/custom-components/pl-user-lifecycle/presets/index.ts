/**
 * PlUserLifecycle - All Presets
 */

export { TimelinePlUserLifecycle } from './timeline';
export { ActionsPlUserLifecycle } from './actions';

import type { PlUserLifecyclePreset } from '../core';
import type { ComponentType } from 'react';
import type { PlUserLifecycleProps } from '../core';
import { TimelinePlUserLifecycle } from './timeline';
import { ActionsPlUserLifecycle } from './actions';

export const PL_USER_LIFECYCLE_PRESETS: Record<PlUserLifecyclePreset, ComponentType<PlUserLifecycleProps>> = {
  timeline: TimelinePlUserLifecycle,
  actions: ActionsPlUserLifecycle,
};
