/**
 * StaffSwapBoard - Main Export
 * Shift swap request management with approve/reject
 */

import type { StaffSwapBoardProps } from './core';
import { STAFF_SWAP_BOARD_DEFAULTS } from './core';
import { STAFF_SWAP_BOARD_PRESETS } from './presets';

export {
  type StaffSwapBoardProps,
  type StaffSwapBoardPreset,
  type ShiftSwapRequest,
  STAFF_SWAP_BOARD_DEFAULTS,
} from './core';
export * from './presets';

export function StaffSwapBoard(props: StaffSwapBoardProps): React.ReactElement {
  const preset = props.preset ?? STAFF_SWAP_BOARD_DEFAULTS.preset ?? 'board';
  const PresetComponent = STAFF_SWAP_BOARD_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StaffSwapBoard.displayName = 'StaffSwapBoard';

export { BoardStaffSwapBoard, TableStaffSwapBoard } from './presets';
