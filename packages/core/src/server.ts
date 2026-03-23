/**
 * Server-safe exports from @rottay/design-system.
 *
 * This entry point contains ONLY utilities that can run in Node.js,
 * Edge Runtime, or middleware -- no React components, no 'use client'.
 *
 * Import as: import { resolveRequestTenant, toSupportedLocale } from '@rottay/design-system/server';
 */

export { resolveRequestTenant } from './runtime/tenancy/resolve-request-tenant';
export type { TenantResolutionOptions } from './runtime/tenancy/resolve-request-tenant';

export { toSupportedLocale } from './i18n/toSupportedLocale';
