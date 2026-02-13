/**
 * BhRecruiterPerformance - All Presets
 */

export { DashboardBhRecruiterPerformance } from './dashboard';
export { CompactBhRecruiterPerformance } from './compact';

import type { BhRecruiterPerformancePreset } from '../core';
import type { ComponentType } from 'react';
import type { BhRecruiterPerformanceProps } from '../core';
import { DashboardBhRecruiterPerformance } from './dashboard';
import { CompactBhRecruiterPerformance } from './compact';

export const BH_RECRUITER_PERFORMANCE_PRESETS: Record<BhRecruiterPerformancePreset, ComponentType<BhRecruiterPerformanceProps>> = {
  dashboard: DashboardBhRecruiterPerformance,
  compact: CompactBhRecruiterPerformance,
};
