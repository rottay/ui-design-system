/**
 * EvCommandCenter - Main Export
 * Unified operations dashboard with crowd, orders, staff, revenue, alerts, and stages panels
 */

import type { EvCommandCenterProps } from './core';
import { EV_COMMAND_CENTER_DEFAULTS } from './core';
import { EV_COMMAND_CENTER_PRESETS } from './presets';

export {
  type EvCommandCenterProps,
  type EvCommandCenterPreset,
  type CommandPanel as EvCommandCenterCommandPanel,
  type CommandAlert as EvCommandCenterCommandAlert,
  EV_COMMAND_CENTER_DEFAULTS,
} from './core';
export * from './presets';

export function EvCommandCenter(props: EvCommandCenterProps): React.ReactElement {
  const preset = props.preset ?? EV_COMMAND_CENTER_DEFAULTS.preset ?? 'fullscreen';
  const PresetComponent = EV_COMMAND_CENTER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvCommandCenter.displayName = 'EvCommandCenter';

export { FullscreenEvCommandCenter, MobileEvCommandCenter } from './presets';
