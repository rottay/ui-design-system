/**
 * @fileoverview Container-scoped preview CSS for a compiled tenant-theme artifact.
 *
 * A compiled artifact's CSS is anchored to the provider-owned document-root
 * selector (`[data-ds-root][data-vertical][data-tenant]`); injecting it as-is
 * would restyle the whole host document when the previewed slug matches the
 * active tenant -- the exact hazard the W1 CMP-02 fix closed for the legacy
 * preview path. Rather than open a second injection path, this module uses the
 * shared preview-scope primitives -- the preview-root scope attribute, the
 * scope-selector builder, the slug sanitizer, and the declaration-value
 * whitelist -- and re-anchors the artifact's already compiler-sanitized
 * variables onto the preview container.
 *
 * @remarks
 * The values are double-checked with the shared `isSafePreviewCssValue`
 * as defense in depth (they already passed the compiler's `isSafeVisualValue`).
 * That whitelist is intentionally the same one the legacy preview uses; a value
 * it does not admit (e.g. a `light-dark()` emission before the whitelist gains
 * that function) is dropped fail-closed rather than injected.
 */

import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  PREVIEW_SCOPE_ATTRIBUTE,
  buildPreviewScopeSelector,
  isSafePreviewCssValue,
  sanitizePreviewSlug,
} from '@/infrastructure/runtime/tenant/runtime/preview-scope';

export { PREVIEW_SCOPE_ATTRIBUTE };

export interface TenantThemePreviewScope {
  /** Sanitized, container-scoped stylesheet ready for a `<style>` block. */
  css: string;
  /** The selector every rule is anchored to; only the preview root carries it. */
  scopeSelector: string;
  /** The preview-root scope attribute value (the sanitized tenant slug). */
  safeSlug: string;
}

/**
 * Re-anchor a compiled artifact's variable block onto the preview container.
 *
 * The artifact slug is sanitized to the CMP-02 scope-attribute value, and every
 * `--ds-*` declaration that passes the shared value whitelist is emitted under
 * the preview scope selector. Returns an empty stylesheet when no declaration
 * survives, so an empty `<style>` never carries a dangling selector.
 */
export function buildTenantThemePreviewScope(
  artifact: Pick<TenantThemeArtifact, 'slug' | 'variables'>
): TenantThemePreviewScope {
  const safeSlug = sanitizePreviewSlug(artifact.slug);
  const scopeSelector = buildPreviewScopeSelector(safeSlug);
  const declarations: string[] = [];
  for (const [name, value] of Object.entries(artifact.variables)) {
    if (name.startsWith('--ds-') && isSafePreviewCssValue(value)) {
      declarations.push(`  ${name}: ${value};`);
    }
  }
  const css = declarations.length > 0 ? `${scopeSelector} {\n${declarations.join('\n')}\n}` : '';
  return { css, scopeSelector, safeSlug };
}
