/**
 * EvBarPos - Main Export
 * Point of sale interface
 * Automatically selects preset based on props
 */

import type { EvBarPosProps } from './core';
import { EV_BAR_POS_DEFAULTS } from './core';
import { EV_BAR_POS_PRESETS } from './presets';

export {
  type EvBarPosProps,
  type EvBarPosPreset,
  type PosProduct as EvBarPosPosProduct,
  type CartItem as EvBarPosCartItem,
  type PosCategory as EvBarPosPosCategory,
  EV_BAR_POS_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvBarPos component
 * Renders the appropriate preset based on the preset prop
 */
export function EvBarPos(props: EvBarPosProps): React.ReactElement {
  const preset = props.preset ?? EV_BAR_POS_DEFAULTS.preset ?? 'cashier';
  const PresetComponent = EV_BAR_POS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvBarPos.displayName = 'EvBarPos';

export { CashierEvBarPos, SelfServiceEvBarPos } from './presets';
