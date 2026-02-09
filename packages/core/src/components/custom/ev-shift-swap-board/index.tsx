/**
 * EvShiftSwapBoard - Main Export
 * Shift swap request board
 * Automatically selects preset based on props
 */

import type { EvShiftSwapBoardProps } from './core';
import { EV_SHIFT_SWAP_BOARD_DEFAULTS } from './core';
import { EV_SHIFT_SWAP_BOARD_PRESETS } from './presets';

export {
  type EvShiftSwapBoardProps,
  type EvShiftSwapBoardPreset,
  type SwapRequest as EvShiftSwapBoardSwapRequest,
  EV_SHIFT_SWAP_BOARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvShiftSwapBoard component
 * Renders the appropriate preset based on the preset prop
 */
export function EvShiftSwapBoard(props: EvShiftSwapBoardProps): React.ReactElement {
  const preset = props.preset ?? EV_SHIFT_SWAP_BOARD_DEFAULTS.preset ?? 'board';
  const PresetComponent = EV_SHIFT_SWAP_BOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvShiftSwapBoard.displayName = 'EvShiftSwapBoard';

export { BoardEvShiftSwapBoard, ListEvShiftSwapBoard } from './presets';
