/**
 * @fileoverview Static tenant artifacts barrel -- config loading and CSS generation.
 * @description Groups the loader (reads `config.json` from a well-known path) and
 * the CSS generator (produces tenant-scoped CSS token files) because they are
 * commonly used together by tenant preview tools and build-time asset pipelines.
 *
 * The loader is consumed by the storage facade at runtime (step 4 in the
 * resolution chain). The generator is consumed by the CLI/build tooling to
 * produce per-tenant CSS files served from `/themes/<slug>.css`.
 */

/** Loads a `config.json` from `/.designsystem/tenants/<slug>/`. */
export { loadStaticTenantConfig } from './loader';

/** CSS generation utilities for producing tenant-scoped stylesheets. */
export { generateTenantCss, generateTenantCssFile, buildTenantSelector } from './generator';
export type { GenerateTenantCssOptions } from './generator';

/** First-party vertical artifact generation (build:vertical-artifacts). */
export {
  renderVerticalArtifact,
  GENERATED_ARTIFACT_BANNER,
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  FIRST_PARTY_ARTIFACT_SPECS,
} from './generator';
export type { RenderVerticalArtifactInput, FirstPartyArtifactSpec } from './generator';
