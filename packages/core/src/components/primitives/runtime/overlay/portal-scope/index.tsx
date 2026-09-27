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
 *   or tenant at runtime.
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
 * mutations while a `<PortalScope>` renders this snapshot, and lazily on the
 * next read after a mutation nobody was consuming.
 */
interface PortalVariableCache {
  readonly anchor: HTMLElement;
  stale: boolean;
  value: DsPortalVariableStyle;
  consumers: number;
}

const VARIABLE_CACHE = Symbol('portal-scope.variables');

type CachedSnapshot = PortalScopeSnapshot & { [VARIABLE_CACHE]?: PortalVariableCache };

function readCachedVariables(cache: PortalVariableCache): DsPortalVariableStyle {
  if (cache.stale) {
    cache.value = readDsPortalVariables(cache.anchor);
    cache.stale = false;
  }
  return cache.value;
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
    const cache: PortalVariableCache = {
      anchor,
      stale: false,
      value: readDsPortalVariables(anchor),
      consumers: 0,
    };
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

    const onMutation = (): void => {
      if (cache.consumers === 0) {
        cache.stale = true;
        publish(false);
        return;
      }
      const previous = readCachedVariables(cache);
      cache.value = readDsPortalVariables(anchor);
      publish(!variablesEqual(previous, cache.value));
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
    return () => observer?.disconnect();
  }, [anchor]);

  return snapshot;
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
  const cache = (snapshot as CachedSnapshot)[VARIABLE_CACHE];
  // While mounted, lineage mutations re-read the variables eagerly so this wrapper re-renders.
  useLayoutEffect(() => {
    if (!cache) return undefined;
    cache.consumers += 1;
    return () => {
      cache.consumers -= 1;
    };
  }, [cache]);
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
