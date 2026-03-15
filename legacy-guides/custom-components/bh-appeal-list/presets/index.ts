/**
 * BhAppealList - All Presets
 */

import type { BhAppealListPreset, BhAppealListProps } from '../core';
import type { ComponentType } from 'react';
import { TableBhAppealList } from './table';
import { CompactBhAppealList } from './compact';

export { TableBhAppealList } from './table';
export { CompactBhAppealList } from './compact';

export const BH_APPEAL_LIST_PRESETS: Record<BhAppealListPreset, ComponentType<BhAppealListProps>> = {
  'table': TableBhAppealList,
  'compact': CompactBhAppealList,
};
