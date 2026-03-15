/**
 * BhJobBoard - Main Export
 * Jobs Overview screen for the BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhJobBoardProps } from './core';
import { BH_JOB_BOARD_DEFAULTS } from './core';
import { BH_JOB_BOARD_PRESETS } from './presets';

export {
  type BhJobBoardProps,
  type BhJobBoardPreset,
  type JobItem,
  type JobStatus,
  type JobUrgency,
  type JobBoardStat,
  type JobBoardFilter,
  type ViewMode,
  type SortDirection,
  type CandidateStage,
  BH_JOB_BOARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhJobBoard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhJobBoard(props: BhJobBoardProps): React.ReactElement {
  const preset = props.preset ?? BH_JOB_BOARD_DEFAULTS.preset ?? 'grid';
  const PresetComponent = BH_JOB_BOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhJobBoard.displayName = 'BhJobBoard';

export { GridBhJobBoard, TableBhJobBoard, KanbanBhJobBoard } from './presets';
