import type { TenantCapabilityDeclaration, TenantConfig } from '@rottay/design-system';
import * as DS from '@rottay/design-system';
import { migrateAndAdmitDocument } from '@rottay/design-system/server';

export function pathOf(declaration: TenantCapabilityDeclaration) {
  return declaration.brandThemePath;
}

export function engineOf(config: TenantConfig) {
  return config.engine;
}

export const registry = DS.TENANT_CAPABILITY_REGISTRY;
export const admit = migrateAndAdmitDocument;
