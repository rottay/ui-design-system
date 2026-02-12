/**
 * StaffPayrollTable - Main Export
 * Payroll calculations table by period with hours, bonuses, deductions
 */

import type { StaffPayrollTableProps } from './core';
import { STAFF_PAYROLL_TABLE_DEFAULTS } from './core';
import { STAFF_PAYROLL_TABLE_PRESETS } from './presets';

export {
  type StaffPayrollTableProps,
  type StaffPayrollTablePreset,
  type PayrollLineItem,
  STAFF_PAYROLL_TABLE_DEFAULTS,
} from './core';
export * from './presets';

export function StaffPayrollTable(props: StaffPayrollTableProps): React.ReactElement {
  const preset = props.preset ?? STAFF_PAYROLL_TABLE_DEFAULTS.preset ?? 'detailed';
  const PresetComponent = STAFF_PAYROLL_TABLE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StaffPayrollTable.displayName = 'StaffPayrollTable';

export { DetailedStaffPayrollTable, SummaryStaffPayrollTable } from './presets';
