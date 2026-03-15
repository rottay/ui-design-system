/**
 * BhRankingBoard - Main Export
 * Candidate Rankings Board for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhRankingBoardProps } from './core';
import { BH_RANKING_BOARD_DEFAULTS } from './core';
import { BH_RANKING_BOARD_PRESETS } from './presets';

export {
  type BhRankingBoardProps,
  type BhRankingBoardPreset,
  type RankedCandidate,
  type DecisionAction,
  type DecisionStatus,
  type ScoreDistribution,
  type RankingFilters,
  type RankingSortBy,
  type SortDirection,
  BH_RANKING_BOARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhRankingBoard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhRankingBoard(props: BhRankingBoardProps): React.ReactElement {
  const preset = props.preset ?? BH_RANKING_BOARD_DEFAULTS.preset ?? 'table';
  const PresetComponent = BH_RANKING_BOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhRankingBoard.displayName = 'BhRankingBoard';

export { TableBhRankingBoard, ComparisonBhRankingBoard } from './presets';
