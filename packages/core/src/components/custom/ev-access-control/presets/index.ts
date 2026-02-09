/**
 * EvAccessControl - All Presets
 */

export { MonitorEvAccessControl } from './monitor';
export { ConfigEvAccessControl } from './config';

import type { EvAccessControlPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvAccessControlProps } from '../core';
import { MonitorEvAccessControl } from './monitor';
import { ConfigEvAccessControl } from './config';

export const EV_ACCESS_CONTROL_PRESETS: Record<EvAccessControlPreset, ComponentType<EvAccessControlProps>> = {
  monitor: MonitorEvAccessControl,
  config: ConfigEvAccessControl,
};
