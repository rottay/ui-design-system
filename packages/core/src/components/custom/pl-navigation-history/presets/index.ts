/**
 * PlNavigationHistory - All Presets
 */

export { TimelinePlNavigationHistory } from './timeline';
export { ListPlNavigationHistory } from './list';

import type { PlNavigationHistoryPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlNavigationHistoryProps } from '../core';
import { TimelinePlNavigationHistory } from './timeline';
import { ListPlNavigationHistory } from './list';

export const PL_NAVIGATION_HISTORY_PRESETS: Record<PlNavigationHistoryPreset, ComponentType<PlNavigationHistoryProps>> = {
  timeline: TimelinePlNavigationHistory,
  list: ListPlNavigationHistory,
};
