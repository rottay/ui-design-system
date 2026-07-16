'use client';

import { useEffect, useState } from 'react';

const PHONE_QUERY = '(max-width: 767px)';
const TABLET_QUERY = '(max-width: 1024px)';

export interface SpatialViewportSnapshot {
  readonly phone: boolean;
  readonly tablet: boolean;
}

const CONSERVATIVE_SNAPSHOT: SpatialViewportSnapshot = Object.freeze({
  phone: true,
  tablet: true,
});

function subscribeMediaQuery(query: MediaQueryList, listener: () => void): () => void {
  try {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', listener);
      return () => {
        try {
          query.removeEventListener('change', listener);
        } catch {
          // A detached/hostile MediaQueryList cannot block component teardown.
        }
      };
    }
  } catch {
    // A partial implementation may attach before throwing. Roll it back before
    // falling through to the legacy Safari listener contract.
    try {
      query.removeEventListener?.('change', listener);
    } catch {
      // Continue with the only remaining subscription contract.
    }
  }

  try {
    if (typeof query.addListener === 'function') {
      query.addListener(listener);
      return () => {
        try {
          query.removeListener(listener);
        } catch {
          // A detached/hostile MediaQueryList cannot block component teardown.
        }
      };
    }
  } catch {
    // As above, avoid retaining a listener from a partial implementation.
    try {
      query.removeListener?.(listener);
    } catch {
      // Missing viewport evidence remains conservative.
    }
  }

  return () => undefined;
}

/**
 * Hydration-safe viewport evidence. The server and first client paint are
 * conservative; only an attached browser query may upgrade the scene.
 */
export function useSpatialViewport(): SpatialViewportSnapshot {
  const [snapshot, setSnapshot] = useState<SpatialViewportSnapshot>(CONSERVATIVE_SNAPSHOT);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;

    let phoneQuery: MediaQueryList;
    let tabletQuery: MediaQueryList;
    try {
      phoneQuery = window.matchMedia(PHONE_QUERY);
      tabletQuery = window.matchMedia(TABLET_QUERY);
    } catch {
      return undefined;
    }
    let mounted = true;

    const publish = (): void => {
      if (!mounted) return;
      let next: SpatialViewportSnapshot;
      try {
        next = Object.freeze({
          phone: phoneQuery.matches,
          tablet: tabletQuery.matches,
        });
      } catch {
        return;
      }
      setSnapshot((current) => (
        current.phone === next.phone && current.tablet === next.tablet
          ? current
          : next
      ));
    };

    const unsubscribePhone = subscribeMediaQuery(phoneQuery, publish);
    const unsubscribeTablet = subscribeMediaQuery(tabletQuery, publish);
    publish();

    return () => {
      mounted = false;
      unsubscribePhone();
      unsubscribeTablet();
    };
  }, []);

  return snapshot;
}
