/**
 * CommandHeader - Main Export
 */

import type { CommandHeaderProps } from './core';
import { COMMAND_HEADER_DEFAULTS } from './core';
import { COMMAND_HEADER_PRESETS } from './presets';

export {
  type CommandHeaderProps,
  type CommandHeaderPreset,
  type KeyMetric,
  type ActivityItem,
  type QuickAction,
  type AIInsight,
  type SystemStatus,
  type TrendDirection,
  COMMAND_HEADER_DEFAULTS,
} from './core';
export * from './presets';

export function CommandHeader(props: CommandHeaderProps): React.ReactElement {
  const preset = props.preset ?? COMMAND_HEADER_DEFAULTS.preset ?? 'full';
  const PresetComponent = COMMAND_HEADER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

CommandHeader.displayName = 'CommandHeader';
