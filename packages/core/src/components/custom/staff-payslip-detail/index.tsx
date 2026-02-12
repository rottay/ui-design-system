/**
 * StaffPayslipDetail - Main Export
 * Individual payment detail with breakdown
 */

import type { StaffPayslipDetailProps } from './core';
import { STAFF_PAYSLIP_DETAIL_DEFAULTS } from './core';
import { STAFF_PAYSLIP_DETAIL_PRESETS } from './presets';

export {
  type StaffPayslipDetailProps,
  type StaffPayslipDetailPreset,
  type PayslipData,
  type PayslipEarning,
  type PayslipDeduction,
  STAFF_PAYSLIP_DETAIL_DEFAULTS,
} from './core';
export * from './presets';

export function StaffPayslipDetail(props: StaffPayslipDetailProps): React.ReactElement {
  const preset = props.preset ?? STAFF_PAYSLIP_DETAIL_DEFAULTS.preset ?? 'full';
  const PresetComponent = STAFF_PAYSLIP_DETAIL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StaffPayslipDetail.displayName = 'StaffPayslipDetail';

export { FullStaffPayslipDetail, CompactStaffPayslipDetail } from './presets';
