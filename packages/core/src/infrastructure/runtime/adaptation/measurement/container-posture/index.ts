'use client';

/**
 * @fileoverview The container posture: the band of a measured box on the
 * tenant's container ladder, measured by one `ResizeObserver` per box. A
 * family attaches it only where its structure changes with the box, and paints
 * the rest through its named `@container` queries.
 *
 * @module Infrastructure/Runtime/Adaptation/ContainerPosture
 * @category Runtime
 * @package @rottay/design-system
 */

import { useContext, useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';

import {
  resolveContainerPosture,
  type ContainerPosture,
  type ContainerPostureThresholds,
} from '@/foundation/contracts/kernel/adaptation';
import {
  resolveResponsivePosture,
  type ResponsivePostureDefinition,
} from '@/foundation/tokens/ts/presentation/responsive-postures';
import { TenantContext } from '@/infrastructure/runtime/tenant/foundation/context';

/**
 * The active container ladder, read from the mounted artifact's normalized
 * appearance and nothing else. Absent, unknown or foreign-schema selections
 * resolve to `balanced`.
 */
export function resolveActiveResponsivePosture(
  appearance: { advanced?: { responsivePosture?: string } } | null | undefined,
): ResponsivePostureDefinition {
  return resolveResponsivePosture(appearance?.advanced?.responsivePosture);
}

/** The one context read of the active container ladder. */
export function useActiveResponsivePosture(): ResponsivePostureDefinition {
  const tenant = useContext(TenantContext);
  const appearance = tenant?.appearance;
  return useMemo(() => resolveActiveResponsivePosture(appearance), [appearance]);
}

/**
 * The container posture of a measured box. Until the box is measured -- on the
 * server, in hydration, and where `ResizeObserver` does not exist -- the
 * caller's fallback governs. Explicit thresholds win over the tenant ladder.
 */
export function useContainerPosture<F extends ContainerPosture | null>(
  containerRef: RefObject<HTMLElement | null>,
  fallback: F,
  thresholds?: ContainerPostureThresholds,
): ContainerPosture | F {
  const active = useActiveResponsivePosture();
  const { compactMaxPx, standardMaxPx } = thresholds ?? active.thresholds;
  const [measured, setMeasured] = useState<ContainerPosture | null>(null);
  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width <= 0) continue;
        const next = resolveContainerPosture(width, {
          thresholds: { compactMaxPx, standardMaxPx },
        });
        setMeasured((current) => (current === next ? current : next));
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef, compactMaxPx, standardMaxPx]);
  return measured ?? fallback;
}
