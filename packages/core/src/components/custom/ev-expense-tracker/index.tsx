/**
 * EvExpenseTracker - Main Export
 * Expense tracking
 * Automatically selects preset based on props
 */

import type { EvExpenseTrackerProps } from './core';
import { EV_EXPENSE_TRACKER_DEFAULTS } from './core';
import { EV_EXPENSE_TRACKER_PRESETS } from './presets';

export {
  type EvExpenseTrackerProps,
  type EvExpenseTrackerPreset,
  type Expense as EvExpenseTrackerExpense,
  type ExpenseCategory as EvExpenseTrackerExpenseCategory,
  EV_EXPENSE_TRACKER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvExpenseTracker component
 * Renders the appropriate preset based on the preset prop
 */
export function EvExpenseTracker(props: EvExpenseTrackerProps): React.ReactElement {
  const preset = props.preset ?? EV_EXPENSE_TRACKER_DEFAULTS.preset ?? 'list';
  const PresetComponent = EV_EXPENSE_TRACKER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvExpenseTracker.displayName = 'EvExpenseTracker';

export { ListEvExpenseTracker, DashboardEvExpenseTracker } from './presets';
