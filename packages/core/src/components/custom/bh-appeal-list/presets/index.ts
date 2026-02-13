/**
 * BhAppealList - All Presets
 */

import type { BhAppealListPreset } from '../core';
import { TableBhAppealList } from './table';
import { CompactBhAppealList } from './compact';

export { TableBhAppealList } from './table';
export { CompactBhAppealList } from './compact';

export const BH_APPEAL_LIST_PRESETS: Record<BhAppealListPreset, React.ComponentType<any>> = {
  'table': TableBhAppealList,
  'compact': CompactBhAppealList,
};
