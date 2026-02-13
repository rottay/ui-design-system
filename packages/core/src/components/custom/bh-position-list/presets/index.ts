/**
 * BhPositionList - All Presets
 */

import type { BhPositionListPreset } from '../core';
import { TableBhPositionList } from './table';
import { CardsBhPositionList } from './cards';

export { TableBhPositionList } from './table';
export { CardsBhPositionList } from './cards';

export const BH_POSITION_LIST_PRESETS: Record<BhPositionListPreset, React.ComponentType<any>> = {
  table: TableBhPositionList,
  cards: CardsBhPositionList,
};
