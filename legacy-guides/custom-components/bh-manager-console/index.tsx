/**
 * BhManagerConsole - Main Export
 * Team Manager Dashboard for BitHire ATS platform
 */

import type { BhManagerConsoleProps } from './core';
import { BH_MANAGER_CONSOLE_DEFAULTS } from './core';
import { BH_MANAGER_CONSOLE_PRESETS } from './presets';

export {
  type BhManagerConsoleProps,
  type BhManagerConsolePreset,
  type Team,
  type TeamKpi,
  type RecruiterWorkload,
  type SlaItem,
  type TaskCard,
  type PipelineStage,
  type PerformanceAlert,
  type SprintSummary,
  type SlaStatus,
  type AlertSeverity,
  type TaskPriority,
  type TrendDirection,
  type DateRangeOption,
  type MetricViewMode,
  BH_MANAGER_CONSOLE_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhManagerConsole component
 * Renders the appropriate preset based on the preset prop
 */
export function BhManagerConsole(props: BhManagerConsoleProps): React.ReactElement {
  const preset = props.preset ?? BH_MANAGER_CONSOLE_DEFAULTS.preset ?? 'overview';
  const PresetComponent = BH_MANAGER_CONSOLE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhManagerConsole.displayName = 'BhManagerConsole';

export { OverviewBhManagerConsole, PerformanceBhManagerConsole } from './presets';
