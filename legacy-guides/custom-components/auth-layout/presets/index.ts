/**
 * AuthLayout Presets
 */

export { MinimalAuthLayout } from './minimal';
export { StandardAuthLayout } from './standard';
export { BrandedAuthLayout } from './branded';
export { SocialAuthLayout } from './social';
export { EnterpriseAuthLayout } from './enterprise';

import type { AuthLayoutPreset } from '../core';
import type { ComponentType } from 'react';
import type { AuthLayoutProps } from '../core';
import { MinimalAuthLayout } from './minimal';
import { StandardAuthLayout } from './standard';
import { BrandedAuthLayout } from './branded';
import { SocialAuthLayout } from './social';
import { EnterpriseAuthLayout } from './enterprise';

export const AUTH_LAYOUT_PRESETS: Record<AuthLayoutPreset, ComponentType<AuthLayoutProps>> = {
  minimal: MinimalAuthLayout,
  standard: StandardAuthLayout,
  branded: BrandedAuthLayout,
  social: SocialAuthLayout,
  enterprise: EnterpriseAuthLayout,
};
