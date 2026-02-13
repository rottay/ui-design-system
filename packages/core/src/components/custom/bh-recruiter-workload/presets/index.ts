/**
 * BhRecruiterWorkload - All Presets
 */

export { BalancerBhRecruiterWorkload } from './balancer';
export { CompactBhRecruiterWorkload } from './compact';

import type { BhRecruiterWorkloadPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhRecruiterWorkloadProps } from '../core';
import { BalancerBhRecruiterWorkload } from './balancer';
import { CompactBhRecruiterWorkload } from './compact';

export const BH_RECRUITER_WORKLOAD_PRESETS: Record<BhRecruiterWorkloadPreset, ComponentType<BhRecruiterWorkloadProps>> = {
  balancer: BalancerBhRecruiterWorkload,
  compact: CompactBhRecruiterWorkload,
};
