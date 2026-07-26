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
 * Cascade layers in ascending precedence order.
 *
 * Later entries win. `rottay-personality` sits above `rottay-tenants` because
 * personality is resolved per product at runtime and is designed to outrank the
 * static tenant artifacts.
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
  'rottay-tenants',
  'rottay-personality',
  'rottay-responsive',
  'components',
  'utilities',
] as const;

/** Layer owned by the static first-party tenant artifacts. */
export const TENANT_CASCADE_LAYER = 'rottay-tenants';

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
