'use client';

/**
 * @fileoverview The one responsive media snapshot: a shared external store and
 * the SSR projection of a request's viewport hint.
 *
 * WHY AN EXTERNAL STORE. The provider used to publish its snapshot from
 * `useState` seeded by a passive `useEffect`. That is a promise the API cannot
 * keep: the first committed value is always the seed, so every server render
 * AND every hydration render resolved as a phone with a coarse pointer, and the
 * real viewport arrived one frame later. `useSyncExternalStore` is the hook that
 * exists for exactly this shape — a value that lives outside React and has a
 * distinct server answer — and it makes the correction a hydration decision
 * instead of a post-paint effect.
 *
 * WHY A HINT AND NOT A GUESS. A server has no viewport. It can, however, be
 * TOLD one: a cookie, a client hint, a user-agent parse. This module turns that
 * one hint into the complete server snapshot. When nothing is known the answer
 * stays the mobile-first baseline, because inventing a desktop the request
 * never claimed would be the same defect pointing the other way.
 *
 * WHY THE HINT IS NEVER READ FROM THE DOCUMENT. `mountTenantTheme` also
 * projects the hint as `data-ds-viewport`, and reading it back here looks like
 * the tidiest possible way to reach the same fact. It is not: React calls the
 * server snapshot once on a machine with no `document` and once in the browser
 * while hydrating, so an attribute read answers `undefined` on the server and
 * `desktop` on the client -- a guaranteed hydration mismatch, which is the
 * defect this module exists to remove, re-entering through the back door. The
 * hint therefore travels as a PROP, which both worlds see identically, and this
 * module exposes no document reader at all.
 *
 * @module Infrastructure/Runtime/Responsive/MediaSnapshot
 * @category Runtime
 * @package @rottay/design-system
 */

import { buildMinWidthQuery } from '@/foundation/contracts/kernel/responsive/breakpoints';
import type { DocumentViewportHint } from '@/infrastructure/runtime/foundation/root-attributes/ssr';

export type { DocumentViewportHint };

export interface ResponsiveMediaSnapshot {
  readonly isSm: boolean;
  readonly isMd: boolean;
  readonly isLg: boolean;
  readonly isXl: boolean;
  readonly is2xl: boolean;
  readonly isTouchDevice: boolean;
  readonly isLandscape: boolean;
  /** True once this snapshot came from a real `matchMedia` read. */
  readonly resolved: boolean;
}

const SM_QUERY = buildMinWidthQuery('sm');
const MD_QUERY = buildMinWidthQuery('md');
const LG_QUERY = buildMinWidthQuery('lg');
const XL_QUERY = buildMinWidthQuery('xl');
const XXL_QUERY = buildMinWidthQuery('2xl');
const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';
const LANDSCAPE_QUERY = '(orientation: landscape)';

type QueryKey = 'isSm' | 'isMd' | 'isLg' | 'isXl' | 'is2xl' | 'isTouchDevice' | 'isLandscape';

const QUERY_STRINGS: Readonly<Record<QueryKey, string>> = Object.freeze({
  isSm: SM_QUERY,
  isMd: MD_QUERY,
  isLg: LG_QUERY,
  isXl: XL_QUERY,
  is2xl: XXL_QUERY,
  isTouchDevice: TOUCH_QUERY,
  isLandscape: LANDSCAPE_QUERY,
});

/**
 * The server snapshot for each tier, taken at the tier's LOWER bound.
 *
 * A tablet request is 640px-wide as far as this projection is concerned, not
 * 1023px: claiming the widest member of a tier would render a layout the
 * narrowest member of the same tier cannot show. Pointer and orientation follow
 * the tier because they are what the hint is a proxy for.
 */
const HINT_SNAPSHOTS: Readonly<Record<DocumentViewportHint, ResponsiveMediaSnapshot>> =
  Object.freeze({
    phone: Object.freeze({
      isSm: false,
      isMd: false,
      isLg: false,
      isXl: false,
      is2xl: false,
      isTouchDevice: true,
      isLandscape: false,
      resolved: false,
    }),
    tablet: Object.freeze({
      isSm: true,
      isMd: false,
      isLg: false,
      isXl: false,
      is2xl: false,
      isTouchDevice: true,
      isLandscape: false,
      resolved: false,
    }),
    desktop: Object.freeze({
      isSm: true,
      isMd: true,
      isLg: true,
      isXl: false,
      is2xl: false,
      isTouchDevice: false,
      isLandscape: true,
      resolved: false,
    }),
  });

/** The mobile-first baseline: what a request that declared nothing gets. */
export const UNHINTED_MEDIA_SNAPSHOT = HINT_SNAPSHOTS.phone;

/** The complete server snapshot a viewport hint stands for. */
export function mediaSnapshotForViewport(
  hint: DocumentViewportHint | undefined,
): ResponsiveMediaSnapshot {
  return hint === undefined ? UNHINTED_MEDIA_SNAPSHOT : HINT_SNAPSHOTS[hint];
}

function snapshotsEqual(a: ResponsiveMediaSnapshot, b: ResponsiveMediaSnapshot): boolean {
  return (
    a.isSm === b.isSm &&
    a.isMd === b.isMd &&
    a.isLg === b.isLg &&
    a.isXl === b.isXl &&
    a.is2xl === b.is2xl &&
    a.isTouchDevice === b.isTouchDevice &&
    a.isLandscape === b.isLandscape &&
    a.resolved === b.resolved
  );
}

const listeners = new Set<() => void>();
let queries: Record<QueryKey, MediaQueryList> | null = null;
let cached: ResponsiveMediaSnapshot = UNHINTED_MEDIA_SNAPSHOT;

/**
 * The `matchMedia` the memoized query set was built from.
 *
 * One browser has one `window.matchMedia` for its whole life, so this is a
 * no-op there. A test harness swaps the function per case, and a query set held
 * over from the previous swap answers every question about a viewport that no
 * longer exists — so the set is keyed by the function that produced it.
 */
let queriesSource: unknown = null;

function supportsMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function ensureQueries(): Record<QueryKey, MediaQueryList> | null {
  if (!supportsMatchMedia()) return null;
  if (queries && queriesSource === window.matchMedia) return queries;
  queriesSource = window.matchMedia;
  cached = UNHINTED_MEDIA_SNAPSHOT;
  queries = {
    isSm: window.matchMedia(QUERY_STRINGS.isSm),
    isMd: window.matchMedia(QUERY_STRINGS.isMd),
    isLg: window.matchMedia(QUERY_STRINGS.isLg),
    isXl: window.matchMedia(QUERY_STRINGS.isXl),
    is2xl: window.matchMedia(QUERY_STRINGS.is2xl),
    isTouchDevice: window.matchMedia(QUERY_STRINGS.isTouchDevice),
    isLandscape: window.matchMedia(QUERY_STRINGS.isLandscape),
  };
  return queries;
}

/**
 * Read the whole live set at once and cache it by VALUE.
 *
 * `useSyncExternalStore` re-invokes this on every render and compares by
 * identity, so a fresh object per call is an infinite render loop. Reading all
 * seven queries in one pass is also what stops a boundary crossing from exposing
 * a transient `desktop && !md` while sibling events are still being delivered.
 */
function readLiveSnapshot(): ResponsiveMediaSnapshot {
  const live = ensureQueries();
  if (!live) return cached;
  const next: ResponsiveMediaSnapshot = {
    isSm: live.isSm.matches,
    isMd: live.isMd.matches,
    isLg: live.isLg.matches,
    isXl: live.isXl.matches,
    is2xl: live.is2xl.matches,
    isTouchDevice: live.isTouchDevice.matches,
    isLandscape: live.isLandscape.matches,
    resolved: true,
  };
  if (!snapshotsEqual(cached, next)) cached = Object.freeze(next);
  return cached;
}

function subscribeToMediaQuery(query: MediaQueryList, listener: () => void): () => void {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }
  if (typeof query.addListener === 'function') {
    query.addListener(listener);
    return () => query.removeListener(listener);
  }
  return () => {};
}

/** Subscribe to every governed viewport query through one shared listener set. */
export function subscribeResponsiveMedia(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  const live = ensureQueries();
  const cleanups = live
    ? Object.values(live).map((query) =>
        subscribeToMediaQuery(query, () => {
          readLiveSnapshot();
          for (const listener of listeners) listener();
        }),
      )
    : [];
  return () => {
    listeners.delete(onStoreChange);
    for (const cleanup of cleanups) cleanup();
  };
}

/** The live snapshot, cached by value so React can compare it by identity. */
export function getResponsiveMediaSnapshot(): ResponsiveMediaSnapshot {
  return readLiveSnapshot();
}

/** Drop the memoized query set. The store rebuilds it on the next read. */
export function resetResponsiveMediaStore(): void {
  queries = null;
  queriesSource = null;
  cached = UNHINTED_MEDIA_SNAPSHOT;
}
