/**
 * Server-safe exports from @rottay/design-system.
 *
 * This entry point contains ONLY utilities that can run in Node.js,
 * Edge Runtime, or middleware -- no React components, no 'use client'.
 *
 * Import as: import { resolveRequestTenant } from '@rottay/design-system/server';
 */

export {
  resolveRequestTenant,
  resolveRequestTenantAsync,
  createEdgeConfigDomainLookup,
} from './runtime/tenant/resolution/resolve-request-tenant';
export type {
  TenantResolutionOptions,
  EdgeConfigDomainLookupOptions,
} from './runtime/tenant/resolution/resolve-request-tenant';

export { toSupportedLocale } from './i18n/toSupportedLocale';
