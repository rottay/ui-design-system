/**
 * StaffPayrollTable - All Presets
 */

export { DetailedStaffPayrollTable } from './detailed';
export { SummaryStaffPayrollTable } from './summary';

import type { StaffPayrollTablePreset } from '../core';
import type { ComponentType } from 'react';
import type { StaffPayrollTableProps } from '../core';
import { DetailedStaffPayrollTable } from './detailed';
import { SummaryStaffPayrollTable } from './summary';

export const STAFF_PAYROLL_TABLE_PRESETS: Record<StaffPayrollTablePreset, ComponentType<StaffPayrollTableProps>> = {
  detailed: DetailedStaffPayrollTable,
  summary: SummaryStaffPayrollTable,
};
