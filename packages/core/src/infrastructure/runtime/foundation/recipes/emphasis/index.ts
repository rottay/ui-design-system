'use client';

/**
 * React seam of the family-emphasis API (C2): apps get one hook that turns
 * a governed (family, intensity) decision into a scope-ready `style` bag of
 * component channels. The values are var() chains over the canon, so tenant
 * identity keeps flowing through whatever scope the app styles; the app
 * never hand-writes `--ds-*` names and never touches :root.
 */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';

import { resolveFamilyEmphasis } from '@/foundation/tokens/ts/presentation/expressive-profiles/emphasis';

export interface ExpressiveEmphasisResult {
  /** Spread onto ONE scoped DS component (Box/Card/etc.), never a root. */
  readonly style: CSSProperties;
}

export function useExpressiveEmphasis(
  family: string,
  intensity: number
): ExpressiveEmphasisResult {
  return useMemo(
    () => ({ style: resolveFamilyEmphasis(family, intensity) as CSSProperties }),
    [family, intensity]
  );
}
