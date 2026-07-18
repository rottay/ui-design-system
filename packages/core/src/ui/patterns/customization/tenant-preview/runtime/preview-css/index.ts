/**
 * @fileoverview Preview CSS scoping and sanitization for TenantPreview.
 *
 * generateTenantCss() emits rules against buildTenantSelector(slug) --
 * `html[data-tenant='<slug>']` -- the document-root attribute owned by
 * TenantProvider. A preview must never publish rules against that selector:
 * inside the preview container they are dead (the container is a div, not
 * `html`), and when the previewed slug equals the active tenant they restyle
 * the entire document. Every rule is therefore re-scoped here to a selector
 * anchored on an attribute only the preview root carries, and every line is
 * whitelist-filtered so hostile config values, names, or slugs cannot escape
 * the injected <style> tag's scope.
 *
 * The scope attribute, slug sanitizer, and declaration-value whitelist are
 * the shared preview-scope primitives owned by
 * `infrastructure/runtime/tenant/runtime/preview-scope`; this module owns only
 * the rescoping state machine that rebuilds generator output line by line.
 */

import type { TenantConfig } from '../../../../../../foundation/contracts';
import {
  buildTenantSelector,
  generateTenantCss,
} from '../../../../../../infrastructure/runtime/tenant';
import {
  buildPreviewScopeSelector,
  isSafePreviewCssValue,
  sanitizePreviewSlug,
} from '../../../../../../infrastructure/runtime/tenant/runtime/preview-scope';

/** One generated declaration: `  <property>: <value>;` on a single line. */
const DECLARATION_PATTERN = /^\s*(--[A-Za-z0-9_-]+|[A-Za-z][A-Za-z0-9-]*)\s*:\s*(.+);\s*$/;

/** Characters permitted in a selector suffix after the tenant base selector. */
const SELECTOR_SUFFIX_PATTERN = /^[A-Za-z0-9[\]='".:()\- ]*$/;

/**
 * Rewrite a generated selector-open line onto the preview scope selector.
 * Returns null unless every comma-separated selector starts with the expected
 * tenant base selector and continues with inert selector characters only.
 */
function rescopeSelectorLine(
  line: string,
  baseSelector: string,
  scopeSelector: string
): string | null {
  if (!line.endsWith('{')) return null;
  const selectorText = line.slice(0, -1).trim();
  if (selectorText.length === 0) return null;

  const rescoped: string[] = [];
  for (const part of selectorText.split(',')) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(baseSelector)) return null;
    const suffix = trimmed.slice(baseSelector.length);
    if (!SELECTOR_SUFFIX_PATTERN.test(suffix)) return null;
    rescoped.push(`${scopeSelector}${suffix}`);
  }
  return `${rescoped.join(', ')} {`;
}

export interface PreviewCss {
  /** Sanitized stylesheet whose every rule is anchored to the scope selector. */
  css: string;
  /** Slug reduced to CSS-inert characters; the scope attribute's value. */
  safeSlug: string;
  /** The full scope selector the css is anchored to. */
  scopeSelector: string;
}

/**
 * Generate tenant CSS for a preview container.
 *
 * The generator is invoked with the sanitized slug so its output selectors
 * are byte-predictable, then rebuilt through a whitelist state machine:
 * only expected selector-open lines (re-anchored to the preview scope),
 * safe single-line declarations, and block closers survive. Comment lines
 * (which interpolate the tenant display name) and anything malformed --
 * including multi-line or block-escaping values -- are dropped.
 */
export function buildPreviewCss(config: TenantConfig): PreviewCss {
  const safeSlug = sanitizePreviewSlug(config.slug);
  const scopeSelector = buildPreviewScopeSelector(safeSlug);
  const baseSelector = buildTenantSelector(safeSlug);

  const generated = generateTenantCss(
    { ...config, slug: safeSlug },
    { includeDarkSelector: false, includeSystemDarkSelector: false }
  );

  const output: string[] = [];
  let insideBlock = false;

  for (const line of generated.split('\n')) {
    if (!insideBlock) {
      const rescoped = rescopeSelectorLine(line, baseSelector, scopeSelector);
      if (rescoped !== null) {
        output.push(rescoped);
        insideBlock = true;
      }
      continue;
    }
    if (line.trim() === '}') {
      output.push('}');
      insideBlock = false;
      continue;
    }
    const declaration = DECLARATION_PATTERN.exec(line);
    if (declaration && isSafePreviewCssValue(declaration[2])) {
      output.push(`  ${declaration[1]}: ${declaration[2]};`);
    }
  }
  if (insideBlock) {
    output.push('}');
  }

  return { css: output.join('\n'), safeSlug, scopeSelector };
}
