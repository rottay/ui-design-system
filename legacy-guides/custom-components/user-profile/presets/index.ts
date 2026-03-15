/**
 * UserProfile - All Presets
 */

import type { UserProfilePreset, UserProfileProps } from '../core';
import type { ComponentType } from 'react';
import { StandardUserProfile } from './standard';
import { PortfolioUserProfile } from './portfolio';

export { StandardUserProfile } from './standard';
export { PortfolioUserProfile } from './portfolio';

export const USER_PROFILE_PRESETS: Record<UserProfilePreset, ComponentType<UserProfileProps>> = {
  standard: StandardUserProfile,
  portfolio: PortfolioUserProfile,
};
