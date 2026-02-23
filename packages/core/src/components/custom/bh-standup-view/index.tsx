/**
 * BhStandupView - Main Export
 * Daily standup view for BitHire recruiting sprints
 * Automatically selects preset based on props
 */

import type { BhStandupViewProps } from './core';
import { BH_STANDUP_VIEW_DEFAULTS } from './core';
import { BH_STANDUP_VIEW_PRESETS } from './presets';

export {
  type BhStandupViewProps,
  type BhStandupViewPreset,
  type StandupEntry,
  type StandupData,
  BH_STANDUP_VIEW_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhStandupView component
 * Renders the appropriate preset based on the preset prop
 */
export function BhStandupView(props: BhStandupViewProps): React.ReactElement {
  const preset = props.preset ?? BH_STANDUP_VIEW_DEFAULTS.preset ?? 'daily';
  const PresetComponent = BH_STANDUP_VIEW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhStandupView.displayName = 'BhStandupView';

export { DailyBhStandupView } from './presets';
