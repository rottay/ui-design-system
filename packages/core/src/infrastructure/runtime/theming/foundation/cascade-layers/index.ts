/**
 * @fileoverview Canonical cascade-layer contract - Rottay Design System
 * @description Mirrors the `@layer` order declared by the CSS entrypoints so
 * runtime emitters can join the designed cascade instead of escaping it.
 *
 * @remarks
 * The order below is the single cascade contract of the design system. It is
 * declared in CSS at `foundation/tokens/css/facade/entrypoints/base.css` and
 * `.../styles.css`; this module restates it in TypeScript for the one emitter
 * that writes CSS at runtime (`SystemCssVariablesBridge`).
 *
 * Restating it creates a drift risk, so the parity is executable: the tests in
 * this folder parse both CSS entrypoints and fail when either side changes
 * without the other. Treat the CSS files as the source and this array as the
 * mirror.
 *
 * WHY a runtime emitter must restate the order: cascade layers are ordered by
 * first appearance in the document. If a runtime `<style>` used a layer name
 * before the DS stylesheet declared the full order, that name would be
 * registered at the wrong position and the designed precedence would invert.
 * Emitting the complete order statement ahead of the rule pins the position
 * regardless of whether the DS stylesheet loaded first, so resolution does not
 * depend on import order.
 *
 * @module Theming/Foundation/CascadeLayers
 * @category Theming
 * @package @rottay/design-system
 */

/**
 * Cascade layers in ascending precedence order. Later entries win.
 *
 * Every layer here is populated by real rules in the shipped bundles. A layer
 * that nothing writes into is not a harmless placeholder: it publishes a
 * position in the cascade that no emitter occupies, and readers reason about
 * precedence from it. `rottay-tenants` was exactly that, and it encoded the
 * WRONG law (see `TENANT_PAINT_IS_UNLAYERED`).
 */
export const ROTTAY_CASCADE_LAYER_ORDER = [
  'theme',
  'base',
  'rottay-framework',
  'rottay-reset',
  'rottay-tokens',
  'rottay-motion',
  'rottay-components',
  'rottay-engines',
  'rottay-personality',
  'rottay-responsive',
  'components',
  'utilities',
] as const;

/**
 * Tenant paint is deliberately UNLAYERED, and this constant exists so that fact
 * is stated once instead of being inferred from the absence of a layer.
 *
 * Both tenant emitters -- the static first-party vertical artifact compiled
 * into each bundle, and the runtime DB artifact injected as a `<style>` during
 * SSR -- emit outside every cascade layer, scoped by
 * `:is(html[data-tenant='x'], :where([data-ds-root][data-vertical='x']))`,
 * which is (0,1,1). Unlayered rules outrank every layered rule regardless of
 * layer order, so the tenant wins its channels by construction.
 *
 * This is REQUIRED by the coverage model, not incidental to it. A compiled
 * artifact declares the channels it owns (`TENANT_THEME_V1_COVERAGE`), the
 * provider silences exactly those emitters, and the artifact must therefore win
 * wherever both would declare the same variable. Putting tenant paint into a
 * layer BELOW `rottay-personality` -- which is what the removed
 * `rottay-tenants` entry did -- inverted that: the subordinate bridge outranked
 * the authority it is subordinate to.
 *
 * Consequence for the app tier: application CSS is unlayered too, so it beats
 * every DS layer but loses to the artifact at `:root` (0,1,0 < 0,1,1). An app
 * reaches tenant paint only by matching (0,1,1) itself -- typically
 * `html[data-tenant] :where(...)` -- or with `!important`. Both are violations
 * of the app-tier limit, not accidents of the cascade.
 */
export const TENANT_PAINT_IS_UNLAYERED = true;

/** Layer owned by the runtime personality emitter. */
export const PERSONALITY_CASCADE_LAYER = 'rottay-personality';

/**
 * Builds the `@layer a, b, c;` statement that pins the full order.
 *
 * Re-declaring an already registered layer name is a no-op for its position, so
 * emitting this is safe whether or not the DS stylesheet loaded first.
 */
export function buildCascadeLayerOrderStatement(): string {
  return `@layer ${ROTTAY_CASCADE_LAYER_ORDER.join(', ')};`;
}

/**
 * Builds the empty `:root` rule wrapped in the personality layer.
 *
 * The text is entirely static -- no token value is ever interpolated into it.
 * Values are written afterwards through CSSOM `setProperty` on the nested rule,
 * so a malformed token value can never break out of its declaration.
 */
export function buildPersonalityRootRuleText(): string {
  return `@layer ${PERSONALITY_CASCADE_LAYER} { :root {} }`;
}
