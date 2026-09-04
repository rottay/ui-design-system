/**
 * @fileoverview Preview scoping and value-sanitization primitives shared by
 * every tenant preview injector (legacy TenantPreview CSS rescoping and the
 * tenant-theme artifact preview).
 *
 * A preview must never publish rules against the document-root tenant
 * selector: inside the preview container they are dead, and when the previewed
 * slug equals the active tenant they restyle the entire document. Every
 * preview rule is therefore anchored to {@link PREVIEW_SCOPE_ATTRIBUTE}, an
 * attribute only the preview root carries, and every declaration value is
 * whitelist-filtered so hostile config values, names, or slugs cannot escape
 * the injected <style> tag's scope.
 *
 * The value checker is the canonical emission grammar
 * (`compilers/kernel/foundation/css/value-safety`), re-exported here under the
 * name this module's consumers already use. The tenant-theme compiler's
 * `isSafeVisualValue` remains a separate INGESTION policy with an authored-caps
 * tier (shadow-layer counts, dimension caps, var-reference ledger); it bounds
 * what a customer may author, not what may be assembled into CSS text.
 */

/** Attribute stamped on the preview root; the only anchor preview CSS may use. */
export const PREVIEW_SCOPE_ATTRIBUTE = 'data-ds-tenant-preview-root';

/**
 * Reduce a slug to characters that are inert inside a CSS attribute selector.
 * Falls back to 'preview' so an all-hostile slug still yields a valid scope.
 */
export function sanitizePreviewSlug(slug: string): string {
  const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return safe.length > 0 ? safe : 'preview';
}

/** Selector every preview rule is anchored to. Matches only elements stamped by the preview root. */
export function buildPreviewScopeSelector(safeSlug: string): string {
  return `[${PREVIEW_SCOPE_ATTRIBUTE}='${safeSlug}']`;
}

/**
 * True when a declaration value cannot terminate the declaration, close the
 * rule block, open a comment, close the <style> element, or trigger a fetch.
 *
 * Re-exported, not restated: the grammar belongs to the emission layer that
 * assembles every declaration in the pipeline, and a second copy here would be
 * a second grammar to keep in step.
 */
export { isSafeCssValue as isSafePreviewCssValue } from '@/infrastructure/compilers/kernel/foundation/css/value-safety';
