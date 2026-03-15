/**
 * BhPositionList - All Presets
 */

import type { BhPositionListPreset, BhPositionListProps } from '../core';
import type { ComponentType } from 'react';
import { TableBhPositionList } from './table';
import { CardsBhPositionList } from './cards';

export { TableBhPositionList } from './table';
export { CardsBhPositionList } from './cards';

export const BH_POSITION_LIST_PRESETS: Record<BhPositionListPreset, ComponentType<BhPositionListProps>> = {
  table: TableBhPositionList,
  cards: CardsBhPositionList,
};
