/**
 * StaffProfile - Main Export
 * Detail panel with personal info, skills, certifications, work history, evaluations
 */

import type { StaffProfileProps } from './core';
import { STAFF_PROFILE_DEFAULTS } from './core';
import { STAFF_PROFILE_PRESETS } from './presets';

export {
  type StaffProfileProps,
  type StaffProfilePreset,
  type StaffProfileData,
  type StaffSkill,
  type StaffCertification,
  type StaffWorkHistory,
  type StaffEvaluation,
  STAFF_PROFILE_DEFAULTS,
} from './core';
export * from './presets';

export function StaffProfile(props: StaffProfileProps): React.ReactElement {
  const preset = props.preset ?? STAFF_PROFILE_DEFAULTS.preset ?? 'full';
  const PresetComponent = STAFF_PROFILE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StaffProfile.displayName = 'StaffProfile';

export { FullStaffProfile, CompactStaffProfile } from './presets';
