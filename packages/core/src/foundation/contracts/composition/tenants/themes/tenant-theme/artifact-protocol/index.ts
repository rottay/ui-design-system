/**
 * @fileoverview Artifact protocol constants for the tenant-theme v1 contract.
 *
 * These bindings are intentionally separable from the full contract: the runtime
 * visual-authority verifier needs the schema version, coverage set and channel
 * vocabulary without importing the compiler, the full tenant config types, or
 * any generated CSS. Keeping them in their own leaf lets both the producer and
 * the consumer depend on the exact same protocol values.
 */

/** The only TenantThemeConfig schema accepted by this release. */
export const TENANT_THEME_SCHEMA_VERSION = 1 as const;

/**
 * Every channel through which tenant visual paint can reach the document.
 *
 * The list is the shared vocabulary between the compiler (which declares what
 * it compiled) and the runtime provider (which decides which of its own
 * emitters must stay silent). A channel names an EMITTER, not a token family:
 * `appearance` is the provider's compiled-appearance variable block,
 * `brand-chrome` is the generated tenant chrome stylesheet, and `personality`
 * is the `SystemCssVariablesBridge` namespaced `--ds-personality-*` data rule.
 * The personality channel does not own canonical component variables: the
 * static personality projection maps its namespaced inputs to those aliases.
 */
export const TENANT_VISUAL_CHANNELS = Object.freeze([
  "visual-branding",
  "token-overrides",
  "appearance",
  "brand-chrome",
  "personality",
] as const);

export type TenantVisualChannel = (typeof TENANT_VISUAL_CHANNELS)[number];

/**
 * v1 compiler coverage. Personality is deliberately NOT covered.
 *
 * The compiled artifact is the only tenant authority; personality is a
 * subordinate product/vertical data axis. Because `personality` stays outside
 * this set, its namespaced bridge remains live under a compiled envelope. A
 * single static projection consumes that data; the bridge itself never paints
 * canonical component channels, so it cannot compete with the artifact.
 */
export const TENANT_THEME_V1_COVERAGE: readonly TenantVisualChannel[] =
  Object.freeze([
    "visual-branding",
    "token-overrides",
    "appearance",
    "brand-chrome",
  ]);
