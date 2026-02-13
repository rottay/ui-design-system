/**
 * BhProctoringEventList - All Presets
 */

import type { BhProctoringEventListPreset } from '../core';
import { TableBhProctoringEventList } from './table';
import { CardsBhProctoringEventList } from './cards';

export { TableBhProctoringEventList } from './table';
export { CardsBhProctoringEventList } from './cards';

export const BH_PROCTORING_EVENT_LIST_PRESETS: Record<BhProctoringEventListPreset, React.ComponentType<any>> = {
  'table': TableBhProctoringEventList,
  'cards': CardsBhProctoringEventList,
};
