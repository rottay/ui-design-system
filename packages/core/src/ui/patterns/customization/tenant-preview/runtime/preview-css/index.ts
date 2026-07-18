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
 * The value checker mirrors the injection-safety core of the tenant-theme
 * compiler's `isSafeVisualValue` (infrastructure/compilers/composition/
 * tenant-theme, module-private there). The authored-caps tier (shadow-layer
 * counts, dimension caps, var-reference ledger) is intentionally not applied:
 * preview values are DS-computed outputs, not authored inputs.
 */

import type { TenantConfig } from '../../../../../../foundation/contracts';
import {
  buildTenantSelector,
  generateTenantCss,
} from '../../../../../../infrastructure/runtime/tenant';

/** Attribute stamped on the preview root; the only anchor preview CSS may use. */
export const PREVIEW_SCOPE_ATTRIBUTE = 'data-ds-tenant-preview-root';

const MAX_VALUE_LENGTH = 512;

/** CSS value functions the tenant CSS generator may legitimately emit. */
const ALLOWED_VALUE_FUNCTIONS = new Set([
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'oklch',
  'lab',
  'lch',
  'color-mix',
  'linear-gradient',
  'radial-gradient',
  'conic-gradient',
  'var',
  'calc',
  'min',
  'max',
  'clamp',
  'blur',
  'saturate',
  'drop-shadow',
  'cubic-bezier',
  'translate',
  'translatex',
  'translatey',
  'scale',
  'scalex',
  'scaley',
  'rotate',
  'repeat',
  'minmax',
  'fit-content',
]);

/** One generated declaration: `  <property>: <value>;` on a single line. */
const DECLARATION_PATTERN = /^\s*(--[A-Za-z0-9_-]+|[A-Za-z][A-Za-z0-9-]*)\s*:\s*(.+);\s*$/;

/** Characters permitted in a selector suffix after the tenant base selector. */
const SELECTOR_SUFFIX_PATTERN = /^[A-Za-z0-9[\]='".:()\- ]*$/;

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
 */
export function isSafePreviewCssValue(value: string): boolean {
  if (value.length === 0 || value.length > MAX_VALUE_LENGTH || value !== value.trim()) {
    return false;
  }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f{};<>[\]@\\]/.test(value)) return false;
  if (/\/\*|\*\/|!\s*important|expression\s*\(|url\s*\(|javascript\s*:|data\s*:|-moz-binding/i.test(value)) {
    return false;
  }

  let parenDepth = 0;
  for (const char of value) {
    if (char === '(') parenDepth += 1;
    else if (char === ')') {
      parenDepth -= 1;
      if (parenDepth < 0) return false;
    }
  }
  if (parenDepth !== 0) return false;
  if ((value.split("'").length - 1) % 2 !== 0) return false;
  if ((value.split('"').length - 1) % 2 !== 0) return false;

  const functionNames = [...value.matchAll(/([a-z][a-z0-9-]*)\s*\(/gi)].map((match) =>
    match[1].toLowerCase()
  );
  return functionNames.every((name) => ALLOWED_VALUE_FUNCTIONS.has(name));
}

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
