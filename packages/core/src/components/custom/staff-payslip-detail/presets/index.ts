/**
 * StaffPayslipDetail - All Presets
 */

export { FullStaffPayslipDetail } from './full';
export { CompactStaffPayslipDetail } from './compact';

import type { StaffPayslipDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { StaffPayslipDetailProps } from '../core';
import { FullStaffPayslipDetail } from './full';
import { CompactStaffPayslipDetail } from './compact';

export const STAFF_PAYSLIP_DETAIL_PRESETS: Record<StaffPayslipDetailPreset, ComponentType<StaffPayslipDetailProps>> = {
  full: FullStaffPayslipDetail,
  compact: CompactStaffPayslipDetail,
};
