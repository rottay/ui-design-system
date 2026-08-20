/**
 * Owns the cascade boundary for the Modern engine's third-party CSS.
 *
 * Tailwind and DaisyUI emit their own `theme`, `base`, `components`, and
 * `utilities` layers. Those names are correct for a standalone framework, but
 * the generated rules are an implementation dependency of the DS, not
 * consumer-authored utilities. Nesting the entire artifact below
 * `rottay-framework` lets first-party tokens and skins win by layer ownership
 * instead of selector specificity while leaving a consuming application's
 * top-level `components` and `utilities` layers free to override the DS.
 */
export const MODERN_FRAMEWORK_LAYER = "rottay-framework";

export function wrapModernFrameworkLayer(css) {
  const normalized = css.trimEnd();
  const opening = `@layer ${MODERN_FRAMEWORK_LAYER} {`;

  // build-vertical-css can be rerun against its own previously generated
  // dist/modern-engine.css. Keep that path byte-stable rather than nesting the
  // framework layer on every invocation.
  if (normalized.startsWith(opening)) return normalized;

  return `${opening}\n${normalized}\n}`;
}
