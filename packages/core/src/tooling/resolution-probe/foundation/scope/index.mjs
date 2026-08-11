/**
 * @fileoverview The scope vocabulary — what shape an element must have to be
 * matched by the shipped CSS.
 *
 * Every selector in the vertical bundles keys off a small, closed set of
 * attributes. A fixture that omits one of them is not measuring the tenant's
 * paint; it is measuring the base layer and reporting it as the tenant's. So
 * the vocabulary is declared once, here, and is derived from the SAME
 * projection the applications use at render time:
 * `src/infrastructure/runtime/foundation/root-attributes/ssr/index.ts`
 * (`resolveDocumentRootAttributes`). That function is TypeScript and this
 * harness runs without a build, so the projection is restated below rather
 * than imported — `assertRootProjectionAgrees()` in `quality/drills` reads the
 * .ts source and fails if the two ever disagree about which attributes exist.
 *
 * THE TWO ARMS. Each generated tenant rule is
 *   :is(html[data-tenant='<slug>'], :where([data-ds-root][data-vertical='<vertical>']))
 * — a legacy document-root arm and a nested-provider arm. The SSR projection
 * emits all three attributes on one element, so both arms match it; that is the
 * honest shape and the one used here. `arm` on a scope row records which arm a
 * caller asked to isolate, when it asks.
 *
 * THEME. Theme is an attribute (`data-theme='light'|'dark'`), optionally
 * mirrored by a `.dark` class. Read the selectors carefully: the bundles carry
 * an unlayered `html[data-tenant]:not([data-theme]):not(.light) *` floor, which
 * is a DARK rule expressed by NEGATION — an element with no `data-theme` at all
 * paints dark. A fixture must therefore always state its theme explicitly, or
 * it silently lands in that floor.
 *
 * @module Tooling/ResolutionProbe/Foundation/Scope
 */

/** The three code-owned verticals, with the slug/key pair their rules key on. */
export const VERTICALS = Object.freeze({
  platform: Object.freeze({
    vertical: 'platform',
    /** `data-tenant` value. NOT equal to the vertical key for platform. */
    tenantSlug: 'rottay',
    distBundle: 'platform.css',
    stylesBundle: 'platform.css',
    /** `facade/artifacts/<dir>/index.css` under src/foundation/tokens/css. */
    artifactDir: 'rottay',
    fontPacks: [],
  }),
  bithire: Object.freeze({
    vertical: 'bithire',
    tenantSlug: 'bithire',
    distBundle: 'bithire.css',
    stylesBundle: 'bithire.css',
    artifactDir: 'bithire',
    fontPacks: ['humanist-text', 'grotesk-display', 'plex-mono'],
  }),
  evnto: Object.freeze({
    vertical: 'evnto',
    tenantSlug: 'evnto',
    distBundle: 'evnto.css',
    stylesBundle: 'evnto.css',
    artifactDir: 'evnto',
    fontPacks: [],
  }),
});

export const VERTICAL_KEYS = Object.freeze(Object.keys(VERTICALS));

/** The theme values a bundle can actually paint. `auto` is never one of these. */
export const THEMES = Object.freeze(['light', 'dark']);

/** Engines whose scope class appears in the bundles. */
export const ENGINES = Object.freeze(['modern', 'rustic', 'classic']);

/**
 * The complete governed root attribute set for one scope.
 *
 * Mirrors `resolveDocumentRootAttributes({ themeMode, engine, locale, tenant })`
 * for an explicit (non-`auto`) theme mode. `data-tenant-theme-mode` is emitted
 * because the real projection always emits it and because at least one selector
 * family negates on `[data-theme]` being absent.
 */
export function rootAttributes({ vertical, theme, engine = 'modern', locale = 'en', arm = 'both' }) {
  const spec = VERTICALS[vertical];
  if (!spec) throw new Error(`unknown vertical: ${vertical}`);
  if (!THEMES.includes(theme)) throw new Error(`unknown theme: ${theme}`);

  /** @type {Record<string, string>} */
  const attributes = {
    'data-theme': theme,
    'data-tenant-theme-mode': theme,
    'data-engine': engine,
    lang: locale,
    dir: 'ltr',
  };

  // The legacy arm is `html[data-tenant=...]`; the provider arm is
  // `[data-ds-root][data-vertical=...]`. `both` is what SSR actually emits.
  if (arm === 'both' || arm === 'legacy') attributes['data-tenant'] = spec.tenantSlug;
  if (arm === 'both' || arm === 'provider') {
    attributes['data-ds-root'] = '';
    attributes['data-vertical'] = spec.vertical;
  }

  return attributes;
}

/** Serialises a root attribute set into the `<html ...>` open tag body. */
export function rootAttributesToHtml(attributes) {
  return Object.entries(attributes)
    .map(([name, value]) => (value === '' ? name : `${name}="${escapeAttribute(value)}"`))
    .join(' ');
}

/**
 * The class list the root carries alongside its attributes.
 *
 * `.dark` is mirrored by the pre-paint script (`buildThemePrepaintScript`) and
 * is matched by `:is([data-theme="dark"], .dark)` selectors, so a dark fixture
 * carries both. A light fixture carries `.light` for the symmetric reason: the
 * dark-by-negation floor excludes on `:not(.light)`.
 */
export function rootClassNames({ theme }) {
  return theme === 'dark' ? ['dark'] : ['light'];
}

/** A stable, human-readable identifier for one scope row. */
export function scopeId({ vertical, theme, engine = 'modern', arm = 'both' }) {
  return `${vertical}/${theme}/${engine}/${arm}`;
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
