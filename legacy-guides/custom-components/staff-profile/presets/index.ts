/**
 * StaffProfile - All Presets
 */

export { FullStaffProfile } from './full';
export { CompactStaffProfile } from './compact';

import type { StaffProfilePreset } from '../core';
import type { ComponentType } from 'react';
import type { StaffProfileProps } from '../core';
import { FullStaffProfile } from './full';
import { CompactStaffProfile } from './compact';

export const STAFF_PROFILE_PRESETS: Record<StaffProfilePreset, ComponentType<StaffProfileProps>> = {
  full: FullStaffProfile,
  compact: CompactStaffProfile,
};
