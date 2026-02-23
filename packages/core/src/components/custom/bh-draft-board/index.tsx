/**
 * BhDraftBoard - Main Export
 * NFL-style candidate drafting board for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhDraftBoardProps } from './core';
import { BH_DRAFT_BOARD_DEFAULTS } from './core';
import { BH_DRAFT_BOARD_PRESETS } from './presets';

export {
  type BhDraftBoardProps,
  type BhDraftBoardPreset,
  type DraftCandidate,
  type DraftCandidateDimension,
  type DraftTeam,
  type DraftPick,
  type DraftConfig,
  type DraftSession,
  BH_DRAFT_BOARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhDraftBoard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhDraftBoard(props: BhDraftBoardProps): React.ReactElement {
  const preset = props.preset ?? BH_DRAFT_BOARD_DEFAULTS.preset ?? 'setup';
  const PresetComponent = BH_DRAFT_BOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhDraftBoard.displayName = 'BhDraftBoard';

export { SetupBhDraftBoard, LiveBhDraftBoard, ResultsBhDraftBoard } from './presets';
