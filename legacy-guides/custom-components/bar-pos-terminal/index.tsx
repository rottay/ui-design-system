/**
 * BarPosTerminal - Main Export
 * POS touch interface for ordering
 * Automatically selects preset based on props
 */

import type { BarPosTerminalProps } from './core';
import { BAR_POS_TERMINAL_DEFAULTS } from './core';
import { BAR_POS_TERMINAL_PRESETS } from './presets';

export {
  type BarPosTerminalProps,
  type BarPosTerminalPreset,
  type PosProduct as BarPosTerminalPosProduct,
  type CartItem as BarPosTerminalCartItem,
  type PosCategory as BarPosTerminalPosCategory,
  BAR_POS_TERMINAL_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BarPosTerminal component
 * Renders the appropriate preset based on the preset prop
 */
export function BarPosTerminal(props: BarPosTerminalProps): React.ReactElement {
  const preset = props.preset ?? BAR_POS_TERMINAL_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BAR_POS_TERMINAL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BarPosTerminal.displayName = 'BarPosTerminal';

export { CompactBarPosTerminal, FullBarPosTerminal } from './presets';
