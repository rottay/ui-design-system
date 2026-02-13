/**
 * BhPositionSla - Main Export
 * SLA countdown monitor for positions in BitHire ATS platform
 */

import type { BhPositionSlaProps } from './core';
import { BH_POSITION_SLA_DEFAULTS } from './core';
import { BH_POSITION_SLA_PRESETS } from './presets';

export {
  type BhPositionSlaProps,
  type BhPositionSlaPreset,
  type PositionSla,
  BH_POSITION_SLA_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPositionSla component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPositionSla(props: BhPositionSlaProps): React.ReactElement {
  const preset = props.preset ?? BH_POSITION_SLA_DEFAULTS.preset ?? 'monitor';
  const PresetComponent = BH_POSITION_SLA_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPositionSla.displayName = 'BhPositionSla';
