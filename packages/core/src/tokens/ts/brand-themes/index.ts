/**
 * @fileoverview First-party brand theme sources.
 *
 * Each file exports a BrandTheme object capturing the canonical visual
 * identity for one Rottay product. These are the SOURCE — tenant CSS
 * becomes a GENERATED artifact from these definitions.
 *
 * Full CSS extraction and parity verification is tracked in Wave E
 * of the system-layers refactor.
 */

export { rottayBrandTheme } from './platform/rottay';
export { bithireBrandTheme } from './bithire/bithire';
export { evntoBrandTheme } from './evnto/evnto';
export { themanagementmiamiBrandTheme } from './bithire/themanagementmiami';

/**
 * Hostile-tenant whitelabel PROOF FIXTURES (WO-GAT-03). NOT product tenants —
 * never registered in KNOWN_TENANTS, BUNDLED_TENANT_SLUGS, or
 * FIRST_PARTY_ARTIFACT_SPECS. See _fixtures/torture.ts for the full rationale.
 */
export { tortureDarkBrandTheme, tortureLightBrandTheme, TORTURE_PROBE_VARS } from './_fixtures/torture';
