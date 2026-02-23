/**
 * BhManagerConsole - All Presets
 */

import type { BhManagerConsolePreset, BhManagerConsoleProps } from '../core';
import type { ComponentType } from 'react';
import { OverviewBhManagerConsole } from './overview';
import { PerformanceBhManagerConsole } from './performance';

export { OverviewBhManagerConsole } from './overview';
export { PerformanceBhManagerConsole } from './performance';

export const BH_MANAGER_CONSOLE_PRESETS: Record<BhManagerConsolePreset, ComponentType<BhManagerConsoleProps>> = {
  'overview': OverviewBhManagerConsole,
  'performance': PerformanceBhManagerConsole,
};
