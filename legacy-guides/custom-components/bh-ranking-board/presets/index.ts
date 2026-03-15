/**
 * BhRankingBoard - All Presets
 */

import type { BhRankingBoardPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhRankingBoardProps } from '../core';
import { TableBhRankingBoard } from './table';
import { ComparisonBhRankingBoard } from './comparison';

export { TableBhRankingBoard } from './table';
export { ComparisonBhRankingBoard } from './comparison';

export const BH_RANKING_BOARD_PRESETS: Record<BhRankingBoardPreset, ComponentType<BhRankingBoardProps>> = {
  table: TableBhRankingBoard,
  comparison: ComparisonBhRankingBoard,
};
