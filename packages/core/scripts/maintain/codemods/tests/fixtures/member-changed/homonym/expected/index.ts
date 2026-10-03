import type { TenantConfig } from './local';
import type { TenantCapabilityDeclaration } from '@rottay/tenancy';

// TenantConfig.engine from '@rottay/design-system' was removed; this is the app's own type.
export function engineOf(config: TenantConfig, declaration: TenantCapabilityDeclaration) {
  return `${config.engine}${declaration.brandThemePath}`;
}
