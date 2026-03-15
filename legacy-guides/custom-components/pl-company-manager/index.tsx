/**
 * PlCompanyManager - Main Export
 * Manage companies with detailed metrics, health scores, and contact information
 */

import type { PlCompanyManagerProps } from './core';
import { PL_COMPANY_MANAGER_DEFAULTS } from './core';
import { PL_COMPANY_MANAGER_PRESETS } from './presets';

export { type PlCompanyManagerProps, type PlCompanyManagerPreset, type Company, type CompanyStatus, type CompanySize, type Industry, PL_COMPANY_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PlCompanyManager(props: PlCompanyManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_COMPANY_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_COMPANY_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlCompanyManager.displayName = 'PlCompanyManager';
