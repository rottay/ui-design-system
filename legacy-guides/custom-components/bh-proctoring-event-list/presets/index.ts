/**
 * BhProctoringEventList - All Presets
 */

import type { BhProctoringEventListPreset, BhProctoringEventListProps } from '../core';
import type { ComponentType } from 'react';
import { TableBhProctoringEventList } from './table';
import { CardsBhProctoringEventList } from './cards';

export { TableBhProctoringEventList } from './table';
export { CardsBhProctoringEventList } from './cards';

export const BH_PROCTORING_EVENT_LIST_PRESETS: Record<BhProctoringEventListPreset, ComponentType<BhProctoringEventListProps>> = {
  'table': TableBhProctoringEventList,
  'cards': CardsBhProctoringEventList,
};
