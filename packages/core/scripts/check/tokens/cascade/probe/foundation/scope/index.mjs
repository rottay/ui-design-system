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

import { resolve } from 'node:path';

import { readFirstPartyRosterSource } from '../../../../../../libraries/roster/index.mjs';
import { CORE_ROOT } from '../paths/index.mjs';

const rosterPath = resolve(
  CORE_ROOT,
  'src/foundation/tokens/ts/presentation/brand-themes/index.ts',
);
const rosterScopes = readFirstPartyRosterSource(rosterPath).map((row) => [
  row.slug,
  Object.freeze({
    vertical: row.slug,
    tenantSlug: row.slug,
    distBundle: row.bundleFile,
    generatedBundle: `${row.slug}/index.css`,
    artifactDir: row.slug,
    fontPacks: row.fontPacks,
  }),
]);

/** The code-owned vertical scopes projected from the authored roster. */
export const VERTICALS = Object.freeze({
  ...Object.fromEntries(rosterScopes),
  none: Object.freeze(TENANT_LESS_SPEC()),
});

/**
 * The tenant-less document: base + engine, no artifact, no tenant attributes.
 *
 * Every other scope here carries a vertical artifact, and an artifact is
 * unlayered tenant paint that outranks the base layer — so a base-layer defect
 * is INVISIBLE in all six tenanted cells by construction. Measured: two names
 * the three artifacts declare identically are read BARE at
 * `themes/default.css:1690-1691`, which resolves for every tenant and to the
 * initial value on a document that has no tenant. Six green cells said nothing
 * about it.
 *
 * Deliberately NOT in `VERTICAL_KEYS`: adding it to the default run would
 * change the shape of every artifact and break comparability with every run
 * taken before it existed. A base-layer lane asks for it with
 * `--vertical none`.
 */
function TENANT_LESS_SPEC() {
  return {
    vertical: 'none',
    /** No `data-tenant`, and therefore no artifact and no shipped bundle. */
    tenantSlug: null,
    distBundle: null,
    generatedBundle: null,
    artifactDir: null,
    fontPacks: [],
  };
}

/** The three tenanted verticals — the default run, unchanged. */
export const VERTICAL_KEYS = Object.freeze(
  Object.keys(VERTICALS).filter((key) => VERTICALS[key].tenantSlug !== null),
);

/** Every scope a run can ask for, tenant-less included. */
export const SCOPE_KEYS = Object.freeze(Object.keys(VERTICALS));

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

  // The tenant-less document carries NEITHER arm. That is the whole point of
  // the scope: no `data-tenant` means no artifact rule matches, so what the
  // base layer alone resolves to becomes observable.
  if (spec.tenantSlug === null) return attributes;

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
