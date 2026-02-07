/**
 * UserProfile - Main Export
 * Automatically selects preset based on props
 */

import type { UserProfileProps } from './core';
import { USER_PROFILE_DEFAULTS } from './core';
import { USER_PROFILE_PRESETS } from './presets';

export { type UserProfileProps, type UserProfilePreset, type UserStat, type SocialLink, type UserProfileTab, type UserProfileNavItem, type AvailabilityStatus, type MediaUploadConfig, USER_PROFILE_DEFAULTS } from './core';
export * from './presets';

/**
 * UserProfile component
 * Renders the appropriate preset based on the preset prop
 */
export function UserProfile(props: UserProfileProps): React.ReactElement {
  const preset = props.preset ?? USER_PROFILE_DEFAULTS.preset ?? 'standard';
  const PresetComponent = USER_PROFILE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

UserProfile.displayName = 'UserProfile';

export { StandardUserProfile, PortfolioUserProfile } from './presets';
