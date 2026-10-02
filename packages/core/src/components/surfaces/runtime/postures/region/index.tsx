'use client';

/**
 * @fileoverview Surface postures runtime: `useSurfacePosture` resolves the
 * app-owned posture declaration in force, and `SurfaceRegion` implements it
 * for one named region — render, collapse or hide per viewport band.
 *
 * The viewport comes from the responsive runtime: on the server (and on the
 * first committed client render) it is the `ssrViewport` hint, so the first
 * paint already carries the phone posture on a phone request. Client-side
 * corrections flow through the same `useSyncExternalStore` snapshot the
 * responsive runtime owns — there is no second measurement here. A hidden
 * region produces no markup at all, so a phone request ships no desktop
 * chrome.
 */

import { useMemo, type ReactNode } from 'react';

import { useResponsive } from '@/infrastructure/runtime/responsive/composition/react/provider';
import {
  resolveSurfacePostures,
  type SurfaceFamily,
  type SurfacePostures,
  type SurfaceRegionDisposition,
} from '../../../foundation/contracts/postures';

/**
 * The posture in force for the current viewport, resolved during render.
 */
export function useSurfacePosture(
  postures: SurfacePostures | undefined,
  family: SurfaceFamily = 'list',
): ReturnType<typeof resolveSurfacePostures> {
  const { deviceClass } = useResponsive();

  return useMemo(
    () => resolveSurfacePostures(postures, deviceClass, family),
    [postures, deviceClass, family],
  );
}

export interface SurfaceRegionProps {
  /** The region name the posture's `regions` map keys on. */
  readonly name: string;
  /** The surface's `postures` declaration; omitted regions render. */
  readonly postures?: SurfacePostures;
  /** The surface family, selecting the default layer. @default 'list' */
  readonly family?: SurfaceFamily;
  /** Accessible name of the region landmark. @default the region name */
  readonly label?: string;
  readonly children?: ReactNode;
}

export function SurfaceRegion({
  name,
  postures,
  family,
  label,
  children,
}: SurfaceRegionProps): React.ReactElement | null {
  const resolved = useSurfacePosture(postures, family);
  const disposition: SurfaceRegionDisposition = resolved.regions[name] ?? 'render';

  if (disposition === 'hide') {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={label ?? name}
      data-surface-region={name}
      data-region-disposition={disposition}
      data-posture={resolved.viewport}
    >
      {disposition === 'render' ? children : null}
    </div>
  );
}

SurfaceRegion.displayName = 'SurfaceRegion';
