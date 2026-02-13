/**
 * BhRecruiterWorkload - Main Export
 * Visual workload balancer for BitHire ATS platform
 */

import type { BhRecruiterWorkloadProps } from './core';
import { BH_RECRUITER_WORKLOAD_DEFAULTS } from './core';
import { BH_RECRUITER_WORKLOAD_PRESETS } from './presets';

export {
  type BhRecruiterWorkloadProps,
  type BhRecruiterWorkloadPreset,
  type RecruiterWorkload,
  BH_RECRUITER_WORKLOAD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhRecruiterWorkload component
 * Renders the appropriate preset based on the preset prop
 */
export function BhRecruiterWorkload(props: BhRecruiterWorkloadProps): React.ReactElement {
  const preset = props.preset ?? BH_RECRUITER_WORKLOAD_DEFAULTS.preset ?? 'balancer';
  const PresetComponent = BH_RECRUITER_WORKLOAD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhRecruiterWorkload.displayName = 'BhRecruiterWorkload';

export { BalancerBhRecruiterWorkload, CompactBhRecruiterWorkload } from './presets';
