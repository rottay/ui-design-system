/**
 * @fileoverview The canonical SSR projection of every governed root attribute.
 *
 * WHY ONE HELPER. Root attributes were assembled ad hoc in each application's
 * root layout: `data-theme` from one resolver, `lang`/`dir` from another,
 * `data-engine` from nowhere at all (it was client-only, so engine-scoped CSS
 * could not match on the first paint). Each app re-derived the same rules and
 * drifted from the others, and nothing could state what the complete set was.
 *
 * This function is that statement. It is PURE and server-safe: no `document`,
 * no `window`, no environment reads. Applications spread its result onto their
 * root element and add nothing of their own.
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It never resolves `auto`. A server cannot
 * know the viewer's `prefers-color-scheme`, so an `auto` tenant renders with
 * its declared FALLBACK and carries `data-tenant-theme-mode="auto"` for the
 * pre-paint script to refine before first paint. The script's entire mandate is
 * that one refinement -- it is not a second authority, and it must never write
 * an attribute this projection did not already emit.
 *
 * @module Runtime/Foundation/RootAttributes/Ssr
 * @package @rottay/design-system
 */

import type { SupportedLocale, TextDirection } from '@/foundation/i18n/kernel/contracts';
import { resolveDocumentLocaleAttributes } from '@/foundation/i18n/runtime/resolution';

/** The tenant's declared theme intent, before any viewer preference. */
export type TenantThemeMode = 'light' | 'dark' | 'auto';

/** The theme actually painted. `auto` is never one of these. */
export type ResolvedTheme = 'light' | 'dark';

/**
 * The density posture the document root declares.
 *
 * DECLARED HERE, NOT IMPORTED. `runtime/foundation/density` owns the React
 * runtime for this vocabulary and is this owner's architectural PEER, so an
 * import in either direction is sibling debt the structure gate refuses. The
 * two declarations are proven identical by an executable assertion in
 * `./tests`, which may cross a boundary production code may not.
 */
export type DocumentDensityPosture = 'compact' | 'comfortable' | 'spacious';

/** Every posture the root channel admits. */
export const DOCUMENT_DENSITY_POSTURES: readonly DocumentDensityPosture[] = Object.freeze([
  'compact',
  'comfortable',
  'spacious',
]);

/**
 * The document-wide motion posture. `system` is the absence of a document
 * policy: the OS media query stays the only authority and no attribute is
 * stamped, which is what `html[data-ds-motion='reduced']` selects against.
 */
export type DocumentMotionPosture = 'system' | 'reduced';

/**
 * The request's viewport tier, as the server knows it (cookie, client hint,
 * or user-agent). It is a HINT, never a measurement: the client republishes
 * the real snapshot from `matchMedia` on its first commit.
 */
export type DocumentViewportHint = 'phone' | 'tablet' | 'desktop';

export interface DocumentRootAttributesInput {
  /** The tenant's declared mode. `auto` defers to the pre-paint script. */
  themeMode: TenantThemeMode;
  /**
   * What `auto` renders as on the server, before the viewer's preference is
   * known. Light is the safe default: a light document that darkens is a
   * one-frame correction, whereas a dark document that lightens flashes.
   */
  autoFallback?: ResolvedTheme;
  /** Active engine. Stamped so engine-scoped CSS matches on the first paint. */
  engine: string;
  /** Active locale; `lang` and `dir` are both derived from it. */
  locale: SupportedLocale;
  /** Tenant scope attributes, when a tenant artifact is mounted. */
  tenant?: { slug: string; verticalKey: string };
  /**
   * Compiled density posture. Stamped here so the cascade resolves
   * `--ds-density-mode-factor` on the FIRST paint instead of after a client
   * effect; `RootDensityProvider` claims the same channel on hydration.
   */
  density?: DocumentDensityPosture;
  /** Document motion policy. `system` stamps nothing and defers to the OS. */
  motion?: DocumentMotionPosture;
  /** Viewport tier the responsive runtime renders its server snapshot for. */
  viewport?: DocumentViewportHint;
  /** Validated recipe-profile id carried by the mounted artifact (D-26). */
  recipeProfile?: string;
}

export interface DocumentRootAttributes {
  'data-theme': ResolvedTheme;
  /** The DECLARED intent, retained so the pre-paint script can refine `auto`. */
  'data-tenant-theme-mode': TenantThemeMode;
  'data-engine': string;
  lang: SupportedLocale;
  dir: TextDirection;
  'data-ds-root'?: '';
  'data-vertical'?: string;
  'data-tenant'?: string;
  'data-density'?: DocumentDensityPosture;
  'data-ds-motion'?: 'reduced';
  'data-ds-viewport'?: DocumentViewportHint;
  'data-recipe-profile'?: string;
}

/**
 * Projects the complete governed root attribute set.
 *
 * `lang`/`dir` come from the same resolver the client provider uses, so server
 * and client cannot disagree about direction for a given locale. (They can
 * still disagree about WHICH locale, if the two read different sources -- that
 * is an application wiring concern, and the point of taking `locale` as an
 * explicit input is that the application must decide it once.)
 */
export function resolveDocumentRootAttributes(
  input: DocumentRootAttributesInput,
): DocumentRootAttributes {
  const {
    themeMode,
    autoFallback = 'light',
    engine,
    locale,
    tenant,
    density,
    motion,
    viewport,
    recipeProfile,
  } = input;

  const { lang, dir } = resolveDocumentLocaleAttributes(locale);

  const attributes: DocumentRootAttributes = {
    'data-theme': themeMode === 'auto' ? autoFallback : themeMode,
    'data-tenant-theme-mode': themeMode,
    'data-engine': engine,
    lang,
    dir,
  };

  if (tenant) {
    attributes['data-ds-root'] = '';
    attributes['data-vertical'] = tenant.verticalKey;
    attributes['data-tenant'] = tenant.slug;
  }

  if (density) attributes['data-density'] = density;
  if (motion === 'reduced') attributes['data-ds-motion'] = 'reduced';
  if (viewport) attributes['data-ds-viewport'] = viewport;
  if (recipeProfile) attributes['data-recipe-profile'] = recipeProfile;

  return attributes;
}

/**
 * The pre-paint script, as a string for `dangerouslySetInnerHTML`.
 *
 * Its ONLY job is resolving `auto` against the viewer's media query before the
 * first paint. It reads `data-tenant-theme-mode` -- which the projection above
 * always emits -- and returns immediately for any explicit mode, so an explicit
 * tenant choice can never be overridden by a system preference.
 *
 * It writes the same three surfaces the provider later claims, and no others:
 * a script that introduced its own attribute would be the fourth writer this
 * whole design exists to remove.
 */
export function buildThemePrepaintScript(): string {
  return (
    '(function(){try{' +
    'var r=document.documentElement;' +
    'if(r.getAttribute("data-tenant-theme-mode")!=="auto")return;' +
    'var d=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;' +
    'var t=d?"dark":"light";' +
    'r.setAttribute("data-theme",t);' +
    'r.classList.toggle("dark",t==="dark");' +
    'r.style.colorScheme=t;' +
    '}catch(e){}})()'
  );
}
