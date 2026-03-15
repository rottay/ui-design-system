/**
 * EvExpenseTracker - All Presets
 */

export { ListEvExpenseTracker } from './list';
export { DashboardEvExpenseTracker } from './dashboard';

import type { EvExpenseTrackerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvExpenseTrackerProps } from '../core';
import { ListEvExpenseTracker } from './list';
import { DashboardEvExpenseTracker } from './dashboard';

export const EV_EXPENSE_TRACKER_PRESETS: Record<EvExpenseTrackerPreset, ComponentType<EvExpenseTrackerProps>> = {
  list: ListEvExpenseTracker,
  dashboard: DashboardEvExpenseTracker,
};
