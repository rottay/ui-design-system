/**
 * BhRecruiterWorkload - All Presets
 */

export { BalancerBhRecruiterWorkloadItem as BalancerBhRecruiterWorkload } from './balancer';
export { CompactBhRecruiterWorkloadItem as CompactBhRecruiterWorkload } from './compact';

import type { BhRecruiterWorkloadPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhRecruiterWorkloadProps } from '../core';
import { BalancerBhRecruiterWorkloadItem } from './balancer';
import { CompactBhRecruiterWorkloadItem } from './compact';

export const BH_RECRUITER_WORKLOAD_PRESETS: Record<BhRecruiterWorkloadPreset, ComponentType<BhRecruiterWorkloadProps>> = {
  balancer: BalancerBhRecruiterWorkloadItem,
  compact: CompactBhRecruiterWorkloadItem,
};
