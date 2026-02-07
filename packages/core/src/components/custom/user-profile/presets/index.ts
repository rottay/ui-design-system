/**
 * UserProfile - All Presets
 */

import type { UserProfilePreset } from '../core';
import { StandardUserProfile } from './standard';
import { PortfolioUserProfile } from './portfolio';

export { StandardUserProfile } from './standard';
export { PortfolioUserProfile } from './portfolio';

export const USER_PROFILE_PRESETS: Record<UserProfilePreset, React.ComponentType<any>> = {
  standard: StandardUserProfile,
  portfolio: PortfolioUserProfile,
};
