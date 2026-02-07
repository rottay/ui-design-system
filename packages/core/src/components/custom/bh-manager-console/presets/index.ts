/**
 * BhManagerConsole - All Presets
 */

import type { BhManagerConsolePreset } from '../core';
import { OverviewBhManagerConsole } from './overview';
import { PerformanceBhManagerConsole } from './performance';

export { OverviewBhManagerConsole } from './overview';
export { PerformanceBhManagerConsole } from './performance';

export const BH_MANAGER_CONSOLE_PRESETS: Record<BhManagerConsolePreset, React.ComponentType<any>> = {
  'overview': OverviewBhManagerConsole,
  'performance': PerformanceBhManagerConsole,
};
