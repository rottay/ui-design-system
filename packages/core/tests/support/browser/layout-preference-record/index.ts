/**
 * @fileoverview Reading what `useLayoutPreference` actually persisted.
 *
 * `src/components/**` may not name browser storage (F-56, enforced by
 * `component-runtime-boundary-gate`), and a test living beside a component is
 * still that component's file. The rule is not cosmetic: a suite that reaches
 * into `window.localStorage` by hand is a second consumer of the storage
 * layout, and it goes stale silently when the runtime changes its key prefix
 * or its record shape.
 *
 * This helper is that second consumer, once, next to the prefix it depends on.
 * It reads the REAL record and returns it whole, so a suite can still assert
 * the exact persisted values rather than a proxy for them.
 */

/** The prefix `useLayoutPreference` writes under. */
export const LAYOUT_PREFERENCE_STORAGE_PREFIX = 'ds-layout-';

/** The persisted record for `key`, or `null` when nothing was written. */
export function readLayoutPreferenceRecord(key: string): Record<string, unknown> | null {
  const raw = window.localStorage.getItem(`${LAYOUT_PREFERENCE_STORAGE_PREFIX}${key}`);
  return raw === null ? null : (JSON.parse(raw) as Record<string, unknown>);
}

/** Drop every persisted layout preference, so a suite starts from nothing. */
export function clearLayoutPreferenceRecords(): void {
  window.localStorage.clear();
}

/**
 * Everything currently in browser storage, as a plain record.
 *
 * A suite proving that a component wrote NOTHING has to be able to look; the
 * alternative is asserting the absence of one key it happens to remember,
 * which passes the moment the component writes a different one.
 */
export function snapshotBrowserStorage(): Record<string, string> {
  const snapshot: Record<string, string> = {};
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key !== null) snapshot[key] = window.localStorage.getItem(key) ?? '';
  }
  return snapshot;
}
