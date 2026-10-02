'use client';

/**
 * @fileoverview Portal scope re-stamping -- shared runtime/overlay owner for
 * carrying the DS/tenant/locale context of an overlay's anchor across the
 * portal boundary. A portaled overlay leaves its trigger's DOM ancestry, so
 * without re-stamping it loses the tenant theme (`data-tenant`/`data-theme`),
 * the DS root scope (`data-ds-root`/`data-vertical`), the locale
 * (`dir`/`lang`) and any inline `--ds-*` overrides a white-labelled shell set
 * on the lineage.
 *
 * This module is the ONE implementation of that context read.
 *
 * - `readPortalScope(anchor)` / `readLocaleContext(anchor)` -- pure readers.
 * - `usePortalScope(anchor)` -- reactive snapshot; a MutationObserver over
 *   the anchor's lineage re-synchronizes when a shell switches locale, theme
 *   or tenant at runtime. Its `--ds-*` variables re-publish on lineage
 *   mutations while a consumer is registered, and lazily on the next read
 *   after one nobody consumed (see `usePortalScopeConsumer`). The same holds
 *   for a change of any media condition the loaded stylesheets declare
 *   `--ds-*` values under (see `readPortalMediaQueries`).
 * - `usePortalScopeConsumer(snapshot, active)` -- registers a live reader of
 *   the snapshot's variables. `<PortalScope>` calls it; an owner that spreads
 *   `snapshot.variables` directly must call it or its copy stays stale.
 * - `<PortalScope snapshot>` -- a `display: contents` wrapper that stamps
 *   `data-portal-scope="true"`, the scope attributes, `dir`/`lang` and the
 *   snapshotted `--ds-*` variables around portaled content.
 *
 * @internal Shared overlay substrate; consumed by modern engines. Not part of
 * the public component contract.
 */

import React, { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import {
  readDsPortalVariables,
  type DsPortalVariableStyle,
} from '../foundation/portal-theme';

/** DS/tenant lineage attributes projected onto portaled overlays. */
export type PortalScopeAttributes = {
  'data-ds-root'?: string;
  'data-vertical'?: string;
  'data-tenant'?: string;
  'data-theme'?: string;
  'data-engine'?: string;
  'data-density'?: string;
};

/** Reactive snapshot of an anchor's portal-crossing context. */
export interface PortalScopeSnapshot {
  scope: PortalScopeAttributes;
  direction: 'ltr' | 'rtl';
  language: string | undefined;
  variables: DsPortalVariableStyle;
}

const EMPTY_SNAPSHOT: PortalScopeSnapshot = {
  scope: {},
  direction: 'ltr',
  language: undefined,
  variables: {},
};

const SCOPE_KEYS: Array<keyof PortalScopeAttributes> = [
  'data-ds-root',
  'data-vertical',
  'data-tenant',
  'data-theme',
  'data-engine',
  'data-density',
];

/**
 * The lineage observer also fires for attribute noise that cannot change the
 * snapshot (e.g. the layer-stack scroll-lock stamping `body.style.overflow`,
 * or unrelated class toggles on ancestors). Equality guards keep those
 * callbacks from producing no-op state updates.
 */
function snapshotsEqual(
  a: PortalScopeSnapshot,
  b: PortalScopeSnapshot,
): boolean {
  if (a.direction !== b.direction || a.language !== b.language) return false;
  if (!SCOPE_KEYS.every((key) => a.scope[key] === b.scope[key])) return false;
  const aKeys = Object.keys(a.variables);
  const bKeys = Object.keys(b.variables);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(
    (key) =>
      (a.variables as Record<string, unknown>)[key] ===
      (b.variables as Record<string, unknown>)[key],
  );
}

function variablesEqual(a: DsPortalVariableStyle, b: DsPortalVariableStyle): boolean {
  return snapshotsEqual({ ...EMPTY_SNAPSHOT, variables: a }, { ...EMPTY_SNAPSHOT, variables: b });
}

/**
 * The `--ds-*` walk covers every computed custom property on the anchor, so it
 * runs only when something will read the result: once on mount, on lineage
 * mutations while a consumer is registered through `usePortalScopeConsumer`,
 * and lazily on the next read after a mutation nobody was consuming.
 */
interface PortalVariableCache {
  readonly anchor: HTMLElement;
  stale: boolean;
  value: DsPortalVariableStyle;
  /** Media match state at the last walk; compared on unconsumed reads. */
  media: string;
  consumers: number;
  /** Attaches the media listeners on the first consumer; returns the detach. */
  watchMedia: (() => () => void) | null;
  unwatchMedia: (() => void) | null;
}

const MEDIA_RULE_QUERIES = new WeakMap<CSSStyleSheet, string[]>();
const DS_DECLARATION = /--ds-[\w-]*\s*:/;

function collectMediaQueries(rules: CSSRuleList, into: Set<string>): void {
  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules[index] as CSSRule & { media?: MediaList; cssRules?: CSSRuleList };
    if (rule.media && DS_DECLARATION.test(rule.cssText)) into.add(rule.media.mediaText);
    if (rule.cssRules) collectMediaQueries(rule.cssRules, into);
  }
}

/**
 * The media conditions under which the document's loaded stylesheets declare
 * `--ds-*` values (width breakpoints, reduced motion, contrast, print...),
 * derived from the CSSOM rather than a fixed list so tenant sheets count too.
 * Cross-origin sheets are unreadable and skipped: a stylesheet served from
 * another origin without CORS silently disables the media re-read for it.
 */
export function readPortalMediaQueries(doc: Document): string[] {
  const queries = new Set<string>();
  for (const sheet of Array.from(doc.styleSheets)) {
    let cached = MEDIA_RULE_QUERIES.get(sheet);
    if (!cached) {
      const found = new Set<string>();
      try {
        collectMediaQueries(sheet.cssRules, found);
      } catch {
        // Cross-origin stylesheet.
      }
      cached = Array.from(found);
      MEDIA_RULE_QUERIES.set(sheet, cached);
    }
    for (const query of cached) queries.add(query);
  }
  return Array.from(queries);
}

function portalMediaLists(anchor: HTMLElement): MediaQueryList[] {
  const view = anchor.ownerDocument.defaultView;
  if (!view || typeof view.matchMedia !== 'function') return [];
  return readPortalMediaQueries(anchor.ownerDocument).map((query) => view.matchMedia(query));
}

function mediaState(anchor: HTMLElement): string {
  return portalMediaLists(anchor)
    .map((list) => `${list.media}=${list.matches ? 1 : 0}`)
    .join('|');
}

function walkVariables(cache: PortalVariableCache): DsPortalVariableStyle {
  cache.value = readDsPortalVariables(cache.anchor);
  cache.media = mediaState(cache.anchor);
  cache.stale = false;
  return cache.value;
}

const VARIABLE_CACHE = Symbol('portal-scope.variables');

type CachedSnapshot = PortalScopeSnapshot & { [VARIABLE_CACHE]?: PortalVariableCache };

function readCachedVariables(cache: PortalVariableCache): DsPortalVariableStyle {
  // Unconsumed caches hold no media listeners, so a media flip is detected here.
  if (cache.consumers === 0 && !cache.stale && mediaState(cache.anchor) !== cache.media) {
    cache.stale = true;
  }
  return cache.stale ? walkVariables(cache) : cache.value;
}

function cachedSnapshot(
  base: Omit<PortalScopeSnapshot, 'variables'>,
  cache: PortalVariableCache,
): PortalScopeSnapshot {
  const snapshot = { ...base } as CachedSnapshot;
  Object.defineProperty(snapshot, 'variables', {
    enumerable: true,
    get: () => readCachedVariables(cache),
  });
  Object.defineProperty(snapshot, VARIABLE_CACHE, { value: cache });
  return snapshot;
}

/**
 * Reads the DS scope attributes an overlay must re-stamp after portaling.
 * Requires a `[data-ds-root]` ancestor: outside a DS root there is no scope
 * to carry and the overlay relies on document-level defaults.
 */
export function readPortalScope(anchor: HTMLElement): PortalScopeAttributes {
  const localRoot = anchor.closest<HTMLElement>('[data-ds-root]');
  if (!localRoot) return {};

  const readRoot = (name: string): string | undefined =>
    localRoot.getAttribute(name) ?? undefined;
  const readNearest = (name: string): string | undefined =>
    anchor.closest<HTMLElement>(`[${name}]`)?.getAttribute(name) ?? undefined;

  return {
    'data-ds-root': readRoot('data-ds-root') ?? '',
    'data-vertical': readNearest('data-vertical') ?? readRoot('data-vertical'),
    'data-tenant': readNearest('data-tenant') ?? readRoot('data-tenant'),
    'data-theme': readNearest('data-theme'),
    'data-engine': readNearest('data-engine'),
    'data-density': readNearest('data-density'),
  };
}

let computedDirectionIsObservable: boolean | undefined;

/**
 * One-time probe: does this runtime resolve `dir` into computed style? Ruling,
 * precedence and shadow-root rationale: direction-authority NAMED_EXCEPTIONS.
 * Cached per module, not per document (iframes, popouts).
 */
function hasComputedDirection(): boolean {
  if (computedDirectionIsObservable !== undefined) return computedDirectionIsObservable;
  if (
    typeof window === 'undefined' ||
    typeof window.getComputedStyle !== 'function' ||
    typeof document === 'undefined'
  ) {
    return false;
  }
  const host = document.createElement('div');
  if (typeof host.attachShadow !== 'function') return false;
  host.style.position = 'fixed';
  document.documentElement.appendChild(host);
  try {
    const probe = document.createElement('div');
    probe.setAttribute('dir', 'rtl');
    host.attachShadow({ mode: 'open' }).appendChild(probe);
    computedDirectionIsObservable = window.getComputedStyle(probe).direction === 'rtl';
  } catch {
    computedDirectionIsObservable = false;
  } finally {
    host.remove();
  }
  return computedDirectionIsObservable;
}

function readAnchorDirection(anchor: HTMLElement): 'ltr' | 'rtl' {
  if (hasComputedDirection()) {
    const computedDirection = window.getComputedStyle(anchor).direction;
    if (computedDirection === 'rtl') return 'rtl';
    if (computedDirection === 'ltr') return 'ltr';
  }
  const directionOwner = anchor.closest<HTMLElement>('[dir]');
  return directionOwner?.dir === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * Reads the locale (direction + language) and, unless `withScope` is false,
 * the DS scope of an anchor.
 */
export function readLocaleContext(anchor: HTMLElement, withScope = true): {
  direction: 'ltr' | 'rtl';
  language: string | undefined;
  portalScope: PortalScopeAttributes;
} {
  const languageOwner = anchor.closest<HTMLElement>('[lang]');
  return {
    direction: readAnchorDirection(anchor),
    language:
      languageOwner?.lang || document.documentElement.lang || undefined,
    portalScope: withScope ? readPortalScope(anchor) : {},
  };
}

/**
 * Keeps a live snapshot of an anchor's portal-crossing context. Runtime
 * locale/theme switches are common in white-labelled shells, so a
 * MutationObserver tracks only the inheritable DS/locale attributes along the
 * anchor's lineage (never whole document subtrees) and re-projects them.
 * Scope and locale stay live unconditionally; `variables` stays live only
 * while a consumer is registered via {@link usePortalScopeConsumer}.
 */
export function usePortalScope(
  anchor: HTMLElement | null,
): PortalScopeSnapshot {
  const [snapshot, setSnapshot] = useState<PortalScopeSnapshot>(EMPTY_SNAPSHOT);
  // Comparing BEFORE calling setSnapshot matters -- a setState whose updater
  // returns the previous value still schedules an update (and trips React's
  // act() warning when the observer callback lands outside a test's act scope).
  const snapshotRef = useRef<PortalScopeSnapshot>(snapshot);

  useLayoutEffect(() => {
    if (!anchor || typeof window === 'undefined') return undefined;
    let disposed = false;
    const cache: PortalVariableCache = {
      anchor,
      stale: true,
      value: {},
      media: '',
      consumers: 0,
      watchMedia: null,
      unwatchMedia: null,
    };
    walkVariables(cache);
    const publish = (variablesChanged: boolean): void => {
      const locale = readLocaleContext(anchor);
      const current = snapshotRef.current as CachedSnapshot;
      const sameLocale =
        current.direction === locale.direction &&
        current.language === locale.language &&
        SCOPE_KEYS.every((key) => current.scope[key] === locale.portalScope[key]);
      if (sameLocale && !variablesChanged && current[VARIABLE_CACHE] === cache) return;
      const next = cachedSnapshot(
        { scope: locale.portalScope, direction: locale.direction, language: locale.language },
        cache,
      );
      snapshotRef.current = next;
      setSnapshot(next);
    };
    publish(true);

    const rewalk = (): void => {
      if (disposed) return;
      const previous = readCachedVariables(cache);
      publish(!variablesEqual(previous, walkVariables(cache)));
    };

    const onMutation = (): void => {
      if (cache.consumers === 0) {
        cache.stale = true;
        publish(false);
        return;
      }
      rewalk();
    };

    // Re-reads only; the lineage is never written, so no feedback loop. The query
    // set is captured on attach: a sheet or insertRule added mid-overlay waits for the next open.
    cache.watchMedia = () => {
      const listeners = portalMediaLists(anchor).map((list) => {
        const onChange = (): void => rewalk();
        list.addEventListener('change', onChange);
        return () => list.removeEventListener('change', onChange);
      });
      return () => {
        for (const remove of listeners) remove();
      };
    };

    const observer =
      typeof MutationObserver === 'undefined' ? null : new MutationObserver(onMutation);
    let owner: HTMLElement | null = anchor;
    while (owner) {
      observer?.observe(owner, {
        attributes: true,
        attributeFilter: [
          'dir',
          'lang',
          'class',
          'style',
          'data-theme',
          'data-engine',
          'data-density',
          'data-tenant',
          'data-vertical',
        ],
      });
      owner = owner.parentElement;
    }
    return () => {
      disposed = true;
      observer?.disconnect();
      cache.unwatchMedia?.();
      cache.unwatchMedia = null;
    };
  }, [anchor]);

  return snapshot;
}

/**
 * Registers a live reader of `snapshot.variables`: while `active`, lineage
 * mutations and media-condition changes re-read the variables eagerly and
 * re-publish the snapshot; media listeners exist only while one is active. An
 * owner that spreads the variables itself instead of rendering
 * `<PortalScope>` must call this, or its copy stays at the last read.
 */
export function usePortalScopeConsumer(
  snapshot: PortalScopeSnapshot,
  active = true,
): void {
  const cache = (snapshot as CachedSnapshot)[VARIABLE_CACHE];
  useLayoutEffect(() => {
    if (!cache || !active) return undefined;
    cache.consumers += 1;
    if (cache.consumers === 1) cache.unwatchMedia = cache.watchMedia?.() ?? null;
    return () => {
      cache.consumers -= 1;
      if (cache.consumers === 0) {
        cache.unwatchMedia?.();
        cache.unwatchMedia = null;
      }
    };
  }, [cache, active]);
}

export interface PortalScopeProps {
  /** Snapshot produced by {@link usePortalScope} for the overlay's anchor. */
  snapshot: PortalScopeSnapshot;
  children: ReactNode;
}

/**
 * Re-stamps the anchor's DS/tenant/locale context around portaled content so
 * tenant skins and inline `--ds-*` overrides resolve exactly as if the
 * overlay had never left the trigger's DOM ancestry. Renders
 * `display: contents` so it adds no layout box.
 */
export function PortalScope({
  snapshot,
  children,
}: PortalScopeProps): React.ReactElement {
  usePortalScopeConsumer(snapshot);
  return (
    <div
      data-portal-scope="true"
      {...snapshot.scope}
      dir={snapshot.direction}
      lang={snapshot.language}
      style={{ display: 'contents', ...snapshot.variables }}
    >
      {children}
    </div>
  );
}

PortalScope.displayName = 'PortalScope';
