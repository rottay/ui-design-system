/**
 * BhTenantSetup - Main Export
 * Tenant Onboarding wizard for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhTenantSetupProps } from './core';
import { BH_TENANT_SETUP_DEFAULTS } from './core';
import { BH_TENANT_SETUP_PRESETS } from './presets';

export {
  type BhTenantSetupProps,
  type BhTenantSetupPreset,
  type SetupStep,
  type BillingMode,
  type ProviderTestResult,
  type TeamSetup,
  type InvitationItem,
  type TenantFormData,
  BH_TENANT_SETUP_DEFAULTS,
  getDefaultSetupSteps,
  getIndustryOptions,
  getSizeOptions,
  getTimezoneOptions,
  getRoleOptions,
} from './core';
export * from './presets';

/**
 * BhTenantSetup component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTenantSetup(props: BhTenantSetupProps): React.ReactElement {
  const preset = props.preset ?? BH_TENANT_SETUP_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_TENANT_SETUP_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTenantSetup.displayName = 'BhTenantSetup';

export { FullBhTenantSetup, QuickBhTenantSetup } from './presets';
