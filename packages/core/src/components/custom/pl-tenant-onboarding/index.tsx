/**
 * PlTenantOnboarding - Main Export
 * Guide new tenants through the onboarding process with step-by-step setup
 */

import type { PlTenantOnboardingProps } from './core';
import { PL_TENANT_ONBOARDING_DEFAULTS } from './core';
import { PL_TENANT_ONBOARDING_PRESETS } from './presets';

export { type PlTenantOnboardingProps, type PlTenantOnboardingPreset, PL_TENANT_ONBOARDING_DEFAULTS } from './core';
export * from './presets';

export function PlTenantOnboarding(props: PlTenantOnboardingProps): React.ReactElement {
  const preset = props.preset ?? PL_TENANT_ONBOARDING_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = PL_TENANT_ONBOARDING_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlTenantOnboarding.displayName = 'PlTenantOnboarding';
