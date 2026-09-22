'use client';

/**
 * @fileoverview Shared-element key registry -- Rottay Design System
 *
 * Two live elements declaring the same `view-transition-name` make the browser
 * skip the WHOLE transition, silently. This registry scopes a shared key to its
 * `LayoutGroup` and claims it for as long as the caller is mounted, so a
 * duplicate is a development-time throw at the second claim instead of a
 * page-wide morph that quietly stopped working.
 */

import { useEffect, useMemo } from 'react';

import { useLayoutGroup } from '../../kernel/group';

/** Claims outside any group, so a standalone duplicate is caught too. */
const standaloneClaims = new Set<string>();

function claimStandalone(key: string): () => void {
  if (standaloneClaims.has(key) && process.env.NODE_ENV !== 'production') {
    throw new Error(
      `Shared-element key "${key}" is already live. Two elements declaring one `
      + 'view-transition-name make the browser skip the transition; scope them '
      + 'with different keys or separate LayoutGroup ids.',
    );
  }
  standaloneClaims.add(key);
  return () => standaloneClaims.delete(key);
}

/**
 * The group-scoped shared key, or `undefined` when the caller named none. The
 * pairing contract is "same group id AND same key on both surfaces".
 */
export function useSharedElementKey(key: string | undefined): string | undefined {
  const group = useLayoutGroup();
  const scopedKey = useMemo(
    () => (key === undefined ? undefined : group ? `${group.id}/${key}` : key),
    [group, key],
  );

  useEffect(() => {
    if (scopedKey === undefined) return;
    return group ? group.claimSharedKey(scopedKey) : claimStandalone(scopedKey);
  }, [group, scopedKey]);

  return scopedKey;
}
