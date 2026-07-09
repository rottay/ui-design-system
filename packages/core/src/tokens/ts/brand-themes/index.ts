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

export { rottayBrandTheme } from './rottay';
export { bithireBrandTheme } from './bithire';
export { evntoBrandTheme } from './evnto';
export { themanagementmiamiBrandTheme } from './themanagementmiami';

/**
 * Hostile-tenant whitelabel PROOF FIXTURES (WO-GAT-03). NOT product tenants —
 * never registered in KNOWN_TENANTS, BUNDLED_TENANT_SLUGS, or
 * FIRST_PARTY_ARTIFACT_SPECS. See torture.ts for the full rationale.
 */
export { tortureDarkBrandTheme, tortureLightBrandTheme, TORTURE_PROBE_VARS } from './torture';
