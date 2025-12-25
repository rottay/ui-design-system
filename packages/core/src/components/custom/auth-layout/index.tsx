/**
 * AuthLayout - Main Export
 * Automatically selects preset based on props
 */

// import React from 'react';
import type { AuthLayoutProps } from './core';
import { AUTH_LAYOUT_DEFAULTS } from './core';
import { AUTH_LAYOUT_PRESETS } from './presets';

export { type AuthLayoutProps, type AuthLayoutPreset, AUTH_LAYOUT_DEFAULTS } from './core';
export * from './presets';

/**
 * AuthLayout component
 * Renders the appropriate preset based on the preset prop
 */
export function AuthLayout(props: AuthLayoutProps): React.ReactElement {
  const preset = props.preset ?? AUTH_LAYOUT_DEFAULTS.preset ?? 'standard';
  const PresetComponent = AUTH_LAYOUT_PRESETS[preset];

  return <PresetComponent {...props} />;
}

AuthLayout.displayName = 'AuthLayout';

// Also export individual presets as named exports for direct use
export { MinimalAuthLayout, StandardAuthLayout, BrandedAuthLayout, SocialAuthLayout, EnterpriseAuthLayout } from './presets';
