/**
 * EvPayrollCenter - All Presets
 */

export { OverviewEvPayrollCenter } from './overview';
export { DetailEvPayrollCenter } from './detail';

import type { EvPayrollCenterPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvPayrollCenterProps } from '../core';
import { OverviewEvPayrollCenter } from './overview';
import { DetailEvPayrollCenter } from './detail';

export const EV_PAYROLL_CENTER_PRESETS: Record<EvPayrollCenterPreset, ComponentType<EvPayrollCenterProps>> = {
  overview: OverviewEvPayrollCenter,
  detail: DetailEvPayrollCenter,
};
